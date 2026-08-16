"""
Convention-based GraphQL layer for the Texon ERP.

Dynamically generates a DjangoObjectType, list/single queries and
Create/Update/Delete mutations for every model in every business app, so the
whole ERP is exposed through one /graphql/ gateway schema.

Hand-written types (registered into TYPE_REGISTRY before the generator runs,
see orders/graphql.py and production/graphql.py) are reused automatically,
which keeps the schema free of duplicate type definitions.
"""

import re
from types import SimpleNamespace

import graphene
from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import IntegrityError, models
from graphene_django import DjangoObjectType

from authentication.models import User

#: model types written by hand (per the frontend GraphQL guide). The generator
#: reuses them instead of creating a second type for the same model.
HAND_WRITTEN = {
    "buyers.Buyer",
    "merchandising.PurchaseOrder",
    "merchandising.Style",
    "merchandising.SampleOrder",
    "merchandising.Season",
    "merchandising.OrderItem",
    "merchandising.OrderStageLog",
    "merchandising.ProductionDowntime",
    "production.ProductionUnit",
    "production.ProductionLine",
    "production.LineCapacity",
    "production.ProductionShift",
    "production.ProductionRecord",
    "production.OEELog",
    "production.DefectLog",
    "production.HeatmapData",
    "production.BottleneckAlert",
}

#: models that get no generated queries (queries are hand-written elsewhere)
QUERY_EXCLUDE = {
    "orders.Order",
    "production.HeatmapData",
}

#: models that get no generated mutations (all models are exposed otherwise)
MUTATION_EXCLUDE = {}

#: app labels to ignore (Django contrib / third party)
SKIP_APPS = {
    "admin", "auth", "contenttypes", "sessions", "messages", "staticfiles",
    "sites", "socialaccount", "account", "registration", "google", "github",
    "dj_rest_auth", "token_blacklist", "unfold", "unfold_filters", "unfold_forms", "unfold_inlines",
    "unfold_importexport", "unfold_guardian", "unfold_simple_history",
    "unfold_location_field", "unfold_constance", "unfold_hijack",
}

TYPE_REGISTRY = {}
_PLURALIZED = {}
_MUTATION_NAMES = set()


def model_key(model):
    return f"{model._meta.app_label}.{model.__name__}"


def snake_case(name):
    name = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", name).lower()


def camel_case(name):
    parts = snake_case(name).split("_")
    return parts[0] + "".join(part.title() for part in parts[1:])


def pluralize(name):
    if name in _PLURALIZED:
        return _PLURALIZED[name]
    if name.endswith("is") and len(name) > 3:
        plural = name[:-2] + "es"
    elif name.endswith("y") and len(name) > 1 and name[-2] not in "aeiou":
        plural = name[:-1] + "ies"
    elif name.endswith(("s", "x", "z", "ch", "sh")):
        plural = name + "es"
    else:
        plural = name + "s"
    _PLURALIZED[name] = plural
    return plural


def _scalar_for_field(field):
    if isinstance(field, models.BooleanField):
        return graphene.Boolean
    if isinstance(field, (models.IntegerField, models.BigIntegerField,
                          models.PositiveIntegerField, models.PositiveSmallIntegerField,
                          models.SmallIntegerField)):
        return graphene.Int
    if isinstance(field, models.FloatField):
        return graphene.Float
    if isinstance(field, models.DecimalField):
        return graphene.Decimal
    if isinstance(field, models.DateTimeField):
        return graphene.DateTime
    if isinstance(field, models.DateField):
        return graphene.Date
    if isinstance(field, models.UUIDField):
        return graphene.UUID
    if isinstance(field, models.JSONField):
        return graphene.JSONString
    return graphene.String


def type_for_model(model):
    """Return the GraphQL type for a model, generating it on first use."""
    key = model_key(model)
    if key in TYPE_REGISTRY:
        return TYPE_REGISTRY[key]

    scalar_names = ["id"] if model._meta.pk.name == "id" else []
    for field in model._meta.concrete_fields:
        if field.is_relation or field.primary_key or field.auto_created:
            continue
        if model is User and field.name == "password":
            continue
        scalar_names.append(field.name)

    meta = type("Meta", (), {"model": model, "fields": tuple(scalar_names)})
    typ = type(f"{model.__name__}Type", (DjangoObjectType,), {"Meta": meta})
    TYPE_REGISTRY[key] = typ

    _bind_relations(typ, model)
    return typ


def _bind_relations(typ, model):
    for field in model._meta.local_fields:
        if not field.is_relation or field.primary_key or field.auto_created:
            continue
        target = field.related_model
        if field.many_to_many:
            typ._meta.fields[field.name] = graphene.Field(
                graphene.List(lambda _m=target: type_for_model(_m))
            )
        else:
            typ._meta.fields[field.name] = graphene.Field(lambda _m=target: type_for_model(_m))

    for rel in model._meta.related_objects:
        if not rel.name or rel.name.endswith("+"):
            continue
        target = rel.related_model
        if rel.one_to_one:
            typ._meta.fields[rel.name] = graphene.Field(lambda _m=target: type_for_model(_m))
        else:
            typ._meta.fields[rel.name] = graphene.Field(
                graphene.List(lambda _m=target: type_for_model(_m))
            )

    for field in model._meta.many_to_many:
        if field.name in typ._meta.fields:
            continue
        target = field.related_model
        typ._meta.fields[field.name] = graphene.Field(
            graphene.List(lambda _m=target: type_for_model(_m))
        )


def business_models():
    for app_config in apps.get_app_configs():
        if app_config.label in SKIP_APPS:
            continue
        for model in app_config.get_models():
            if model._meta.abstract or model._meta.proxy:
                continue
            yield model


def build_query_fields():
    """Query fields for every business model (allX, xById)."""
    fields = {}
    for model in business_models():
        key = model_key(model)
        if key in QUERY_EXCLUDE:
            continue
        typ = type_for_model(model)
        model_name = model.__name__
        list_name = f"all_{snake_case(pluralize(model_name))}"
        by_id_name = f"{snake_case(model_name)}_by_id"
        fields[list_name] = graphene.List(typ)
        fields[f"resolve_{list_name}"] = staticmethod(
            lambda root, info, _m=model: _m.objects.all()
        )
        fields[by_id_name] = graphene.Field(typ, id=graphene.ID(required=True))
        fields[f"resolve_{by_id_name}"] = staticmethod(
            lambda root, info, id, _m=model: _m.objects.filter(pk=id).first()
        )
    return fields


def _unique_mutation_name(base):
    name = base
    suffix = 2
    while name in _MUTATION_NAMES:
        name = f"{base}{suffix}"
        suffix += 1
    _MUTATION_NAMES.add(name)
    return name


def _coerce_id(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return value


def _mutation_args(model, required):
    args = {}
    for field in model._meta.local_concrete_fields:
        if field.primary_key or field.auto_created:
            continue
        if field.is_relation:
            req = required and not (field.null or field.blank)
            args[f"{field.name}_id"] = graphene.ID(required=req)
            continue
        if getattr(field, "auto_now", False) or getattr(field, "auto_now_add", False):
            continue
        req = required and not (field.has_default() or field.null or field.blank)
        args[field.name] = _scalar_for_field(field)(required=req)
    for field in model._meta.many_to_many:
        args[f"{field.name}_ids"] = graphene.List(graphene.ID)
    return args


def _build_create_mutation(model):
    typ = type_for_model(model)
    name = _unique_mutation_name(f"Create{model.__name__}")
    args = _mutation_args(model, required=True)
    output_field = camel_case(model.__name__)

    def mutate(root, info, **kwargs):
        return _apply_mutation(model, typ, output_field, kwargs, create=True)

    return type(name, (graphene.Mutation,), {
        "Arguments": type("Arguments", (), args),
        output_field: graphene.Field(typ),
        "ok": graphene.Boolean(required=True),
        "errors": graphene.List(graphene.String),
        "mutate": staticmethod(mutate),
    })


def _build_update_mutation(model):
    typ = type_for_model(model)
    name = _unique_mutation_name(f"Update{model.__name__}")
    args = _mutation_args(model, required=False)
    args["id"] = graphene.ID(required=True)
    output_field = camel_case(model.__name__)

    def mutate(root, info, **kwargs):
        return _apply_mutation(model, typ, output_field, kwargs, create=False)

    return type(name, (graphene.Mutation,), {
        "Arguments": type("Arguments", (), args),
        output_field: graphene.Field(typ),
        "ok": graphene.Boolean(required=True),
        "errors": graphene.List(graphene.String),
        "mutate": staticmethod(mutate),
    })


def _build_delete_mutation(model):
    name = _unique_mutation_name(f"Delete{model.__name__}")

    def mutate(root, info, id):
        obj = model.objects.filter(pk=_coerce_id(id)).first()
        if obj is None:
            return SimpleNamespace(ok=False, errors=[f"{model.__name__} with id {id} not found"], deleted_id=None)
        deleted_id = id
        obj.delete()
        return SimpleNamespace(ok=True, errors=None, deleted_id=deleted_id)

    return type(name, (graphene.Mutation,), {
        "Arguments": type("Arguments", (), {"id": graphene.ID(required=True)}),
        "ok": graphene.Boolean(required=True),
        "errors": graphene.List(graphene.String),
        "deletedId": graphene.ID(),
        "mutate": staticmethod(mutate),
    })


def _apply_mutation(model, typ, output_field, kwargs, create):
    def finish(ok, errors, obj=None):
        return SimpleNamespace(ok=ok, errors=errors, **{output_field: obj})

    m2m = {}
    fk = {}
    scalars = {}
    for key, value in kwargs.items():
        if key.endswith("_ids"):
            m2m[key[:-4]] = value
        elif key.endswith("_id"):
            fk[key[:-3]] = _coerce_id(value)
        else:
            scalars[key] = value

    if create:
        obj = model(**scalars, **{f"{key}_id": value for key, value in fk.items()})
    else:
        obj = model.objects.filter(pk=_coerce_id(kwargs["id"])).first()
        if obj is None:
            return finish(False, [f"{model.__name__} with id {kwargs['id']} not found"])
        for key, value in scalars.items():
            setattr(obj, key, value)
        for key, value in fk.items():
            setattr(obj, f"{key}_id", value)

    try:
        if model is User and "password" in scalars:
            obj.set_password(scalars.pop("password"))
        obj.full_clean(exclude=[f.name for f in model._meta.many_to_many])
        obj.save()
    except (IntegrityError, ValidationError) as exc:
        if isinstance(exc, ValidationError):
            return finish(False, [
                f"{field}: {', '.join(errors)}" for field, errors in exc.message_dict.items()
            ])
        return finish(False, [str(exc)])

    for name, ids in m2m.items():
        getattr(obj, name).set([_coerce_id(i) for i in ids])

    return finish(True, None, obj)


def build_mutation_fields():
    """Mutation fields (createX, updateX, deleteX) for every business model."""
    fields = {}
    for model in business_models():
        key = model_key(model)
        if key in MUTATION_EXCLUDE:
            continue
        model_name = model.__name__
        fields[f"create_{snake_case(model_name)}"] = _build_create_mutation(model).Field()
        fields[f"update_{snake_case(model_name)}"] = _build_update_mutation(model).Field()
        fields[f"delete_{snake_case(model_name)}"] = _build_delete_mutation(model).Field()
    return fields