from django.urls import include, path

app_name = "api"

urlpatterns = [
    path("v1/auth/", include("authentication.urls")),
    path("v1/", include("buyers.urls")),
    path("v1/", include("merchandising.urls")),
    path("v1/", include("ie_planning.urls")),
    path("v1/", include("production.urls")),
    path("v1/", include("inventory.urls")),
    path("v1/", include("procurement.urls")),
    path("v1/", include("quality.urls")),
    path("v1/", include("subcontract.urls")),
    path("v1/", include("accounts.urls")),
    path("v1/", include("commercial.urls")),
    path("v1/", include("crm.urls")),
    path("v1/", include("hr.urls")),
    path("v1/", include("fixed_assets.urls")),
    path("v1/", include("tna.urls")),
    path("v1/", include("multi_company.urls")),
    path("v1/", include("costing.urls")),
    path("v1/", include("orders.urls")),
    path("v1/", include("compliance.urls")),
    path("v1/", include("reporting.urls")),
    path("v1/", include("performance.urls")),
    path("v1/", include("planning.urls")),
    path("v1/", include("scheduling.urls")),
    path("v1/", include("rbac.urls")),
    path("v1/ai/", include("ai.urls")),
]
