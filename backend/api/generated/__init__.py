"""
Generated API module from OpenAPI schema (docs/scema.yaml).
This module provides complete Model, Serializer, ViewSet, and URL
implementations for all endpoints defined in the schema.

Each sub-package corresponds to a Django app domain:
- accounts, ai, authentication, buyers, commercial, compliance,
  costing, crm, fixed_assets, hr, inventory, merchandising,
  multi_company, orders, performance, planning, procurement,
  production, quality, reporting, scheduling, subcontract, tna

Usage:
    Add to INSTALLED_APPS:
        "api.generated.accounts",
        "api.generated.hr",
        ...

    Include in URLConf:
        path("v1/", include("api.generated.accounts.urls")),
        path("v1/", include("api.generated.hr.urls")),
        ...
"""
