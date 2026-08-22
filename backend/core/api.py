"""
Generic REST API layer for all project models.

One serializer + viewset factory introspects every model of the project apps.
The generated route set is documented in docs/backend/01-rest-api-design.md
(103 model endpoints + infra). This is the single API gateway — every endpoint
enforces authentication, model permissions and object-level ownership checks.
"""

import re

from django.apps import apps
from django.db import models
from rest_framework import serializers, viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated

from core.mixins import OwnerQuerysetMixin
from core.permissions import IsFinanceRole, IsObjectOwnerOrStaff
from rbac.permissions import require_perms_for_actions

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
# (docs/backend/01-rest-api-design.md): user management lives behind the
# RBAC-guarded /api/v1/users/ endpoint (authentication/api.py).
# rbac.Permission/Role/RolePermission/UserRole are served by the dedicated
# RBAC management API (rbac/views.py) with require_perms() enforcement —
# never through the generic factory.
SKIP_MODELS = {
    ("authentication", "OTP"),
    ("authentication", "SocialAuthCallbackUrl"),
    ("authentication", "User"),
    ("rbac", "Permission"),
    ("rbac", "Role"),
    ("rbac", "RolePermission"),
    ("rbac", "UserRole"),
}

# Models exposed read-only (reference data).
READ_ONLY_MODELS = {
    ("core", "Location"),
    ("core", "Currency"),
}

# App-level tier guard (defence in depth on top of DjangoModelPermissions).
# Users from other departments are rejected even if they hold model perms.
TIER_REQUIRED = {
    "accounts": IsFinanceRole,
}

# RBAC write guards for the generic layer (defence in depth on top of
# DjangoModelPermissions). Unsafe actions on these apps additionally require
# the matching seeded RBAC codename; reads stay governed by model perms +
# owner scoping. Superusers bypass via the permission helper.
APP_RBAC_WRITE_PERM = {
    "orders": "orders.create",
    "buyers": "buyers.manage",
    "procurement": "procurement.manage",
    "inventory": "inventory.manage",
    "quality": "quality.manage",
    "ie_planning": "ie.manage",
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

# Field types django-filter can build an AutoFilterSet for (JSONField etc. excluded).
FILTERABLE_TYPES = (
    models.CharField,
    models.TextField,
    models.IntegerField,
    models.PositiveIntegerField,
    models.PositiveSmallIntegerField,
    models.BigIntegerField,
    models.DecimalField,
    models.FloatField,
    models.BooleanField,
    models.DateField,
    models.DateTimeField,
    models.TimeField,
    models.UUIDField,
    models.ForeignKey,
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
    filterable = [f for f in model._meta.concrete_fields if isinstance(f, FILTERABLE_TYPES)]
    filterable_names = [f.name for f in filterable]

    search_fields = [
        f.name for f in filterable if isinstance(f, (models.CharField, models.TextField))
    ]
    for f in model._meta.concrete_fields:
        if isinstance(f, models.ForeignKey):
            name_field = _display_field(f.remote_field.model)
            if name_field:
                search_fields.append(f"{f.name}__{name_field}")

    # Security stack (IDOR defence):
    #   IsAuthenticated        — no anonymous access
    #   DjangoModelPermissions — model-level add/change/delete/view perms
    #   IsObjectOwnerOrStaff   — object-level: only the row owner (or staff)
    # OwnerQuerysetMixin scopes the queryset so foreign rows 404 entirely.
    permission_classes = [IsAuthenticated, DjangoModelPermissions, IsObjectOwnerOrStaff]
    tier_class = TIER_REQUIRED.get(model._meta.app_label)
    if tier_class is not None:
        permission_classes = [IsAuthenticated, tier_class, DjangoModelPermissions, IsObjectOwnerOrStaff]
    rbac_write_perm = APP_RBAC_WRITE_PERM.get(model._meta.app_label)
    if rbac_write_perm is not None:
        permission_classes = permission_classes + [
            require_perms_for_actions(
                {
                    "create": (rbac_write_perm,),
                    "update": (rbac_write_perm,),
                    "partial_update": (rbac_write_perm,),
                    "destroy": (rbac_write_perm,),
                }
            ),
        ]

    attrs = {
        "queryset": model.objects.select_related(*fk_names).all(),
        "serializer_class": build_serializer(model),
        "permission_classes": permission_classes,
        "filterset_fields": filterable_names,
        "search_fields": search_fields,
        "ordering_fields": filterable_names,
    }

    if read_only:
        base = (OwnerQuerysetMixin, viewsets.ReadOnlyModelViewSet)
    else:
        base = (OwnerQuerysetMixin, viewsets.ModelViewSet)
    viewset_cls = type(f"{model.__name__}ViewSet", base, attrs)
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
