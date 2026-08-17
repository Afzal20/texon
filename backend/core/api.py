"""
Generic REST API layer for all project models.

One serializer + viewset factory introspects every model of the project apps,
mirroring the GraphQL registry approach. The generated route set is documented
in docs/backend/01-rest-api-design.md (103 model endpoints + infra).
"""

import re

from django.apps import apps
from django.db import models
from rest_framework import serializers, viewsets
from rest_framework.permissions import DjangoModelPermissions

PROJECT_APPS = [
    "authentication",
    "core",
    "buyers",
    "merchandising",
    "ie_planning",
    "production",
    "inventory",
    "procurement",
    "quality",
    "subcontract",
    "accounts",
    "commercial",
    "crm",
    "hr",
    "fixed_assets",
    "tna",
    "multi_company",
    "costing",
    "orders",
    "compliance",
    "reporting",
    "performance",
    "planning",
    "scheduling",
    "rbac",
]

# Models that must never be exposed via REST (join tables, auth internals).
# authentication.User is intentionally absent from the documented endpoint list
# (docs/backend/01-rest-api-design.md): user management stays on the auth
# endpoints and the GraphQL gateway.
SKIP_MODELS = {
    ("authentication", "OTP"),
    ("authentication", "SocialAuthCallbackUrl"),
    ("authentication", "User"),
    ("rbac", "RolePermission"),
    ("rbac", "UserRole"),
}

# Models exposed read-only (reference data).
READ_ONLY_MODELS = {
    ("core", "Location"),
    ("core", "Currency"),
}

# Slug overrides — must match docs/backend/01-rest-api-design.md exactly.
SLUG_OVERRIDES = {
    "AccountsPayable": "accounts-payable",
    "AccountsReceivable": "accounts-receivable",
    "Attendance": "attendance-records",
    "Overtime": "overtime-records",
    "DevelopmentMonitoring": "development-monitoring",
    "SkillInventory": "skill-inventory",
    "HeatmapData": "heatmap-data",
    "LetterOfCredit": "letters-of-credit",
    "BillOfExchange": "bills-of-exchange",
}


def model_slug(model):
    """kebab-case plural of a model name, e.g. ChartOfAccount -> chart-of-accounts."""
    name = model.__name__
    if name in SLUG_OVERRIDES:
        return SLUG_OVERRIDES[name]
    snake = re.sub(r"(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])", "_", name).lower()
    parts = snake.split("_")
    last = parts[-1]
    if last.endswith("is"):
        last = last[:-2] + "es"  # analysis -> analyses
    elif last.endswith("y") and len(last) > 1 and last[-2] not in "aeiou":
        last = last[:-1] + "ies"  # inventory -> inventories
    elif last.endswith(("s", "x", "z", "ch", "sh")):
        last += "es"
    else:
        last += "s"
    parts[-1] = last
    return "-".join(parts)


NAME_PREFERRED = (
    "name",
    "title",
    "label",
    "code",
    "number",
    "account_name",
    "po_number",
    "order_number",
    "invoice_number",
)


def _display_field(rel_model):
    """First human-readable char field of a related model, or None."""
    for f in rel_model._meta.concrete_fields:
        if isinstance(f, (models.CharField, models.TextField)) and f.name in NAME_PREFERRED:
            return f.name
    for f in rel_model._meta.concrete_fields:
        if isinstance(f, models.CharField):
            return f.name
    return None


def build_serializer(model):
    """ModelSerializer with all scalar fields + read-only FK name mirrors + choice labels."""
    fk_fields = [f for f in model._meta.concrete_fields if isinstance(f, models.ForeignKey)]
    choice_fields = [f for f in model._meta.concrete_fields if f.choices]
    base_fields = [f.name for f in model._meta.concrete_fields]

    attrs = {}
    for f in fk_fields:
        field_name = f"{f.name}_name"

        def make_getter(f):
            def getter(self, obj):
                rel = getattr(obj, f.name)
                if rel is None:
                    return None
                name_field = _display_field(f.remote_field.model)
                return str(getattr(rel, name_field)) if name_field else str(rel)

            return getter

        attrs[f"get_{field_name}"] = make_getter(f)
        attrs[field_name] = serializers.SerializerMethodField()
        base_fields.append(field_name)

    for f in choice_fields:
        field_name = f"{f.name}_display"

        def make_choice_getter(f):
            def getter(self, obj):
                method = getattr(obj, f"get_{f.name}_display")
                return method()

            return getter

        attrs[f"get_{field_name}"] = make_choice_getter(f)
        attrs[field_name] = serializers.SerializerMethodField()
        base_fields.append(field_name)

    meta = type(
        "Meta",
        (),
        {
            "model": model,
            "fields": base_fields,
            "read_only_fields": ("id", "created_at", "updated_at"),
        },
    )
    attrs["Meta"] = meta
    return type(f"{model.__name__}Serializer", (serializers.ModelSerializer,), attrs)


def build_viewset(model, read_only=False):
    fk_names = [f.name for f in model._meta.concrete_fields if isinstance(f, models.ForeignKey)]
    scalar_fields = [f.name for f in model._meta.concrete_fields]

    search_fields = [
        f.name for f in model._meta.concrete_fields if isinstance(f, (models.CharField, models.TextField))
    ]
    for f in model._meta.concrete_fields:
        if isinstance(f, models.ForeignKey):
            name_field = _display_field(f.remote_field.model)
            if name_field:
                search_fields.append(f"{f.name}__{name_field}")

    attrs = {
        "queryset": model.objects.select_related(*fk_names).all(),
        "serializer_class": build_serializer(model),
        "permission_classes": [DjangoModelPermissions],
        "filterset_fields": scalar_fields,
        "search_fields": search_fields,
        "ordering_fields": scalar_fields,
    }

    if read_only:
        viewset_cls = type(f"{model.__name__}ViewSet", (viewsets.ReadOnlyModelViewSet,), attrs)
    else:
        viewset_cls = type(f"{model.__name__}ViewSet", (viewsets.ModelViewSet,), attrs)
    return viewset_cls


def get_registry():
    """{endpoint_slug: viewset_class} for every exposed project model."""
    registry = {}
    for app_label in PROJECT_APPS:
        try:
            app_config = apps.get_app_config(app_label)
        except LookupError:
            continue
        for model in app_config.get_models():
            key = (app_label, model.__name__)
            if key in SKIP_MODELS:
                continue
            registry[model_slug(model)] = build_viewset(model, read_only=(key in READ_ONLY_MODELS))
    return registry
