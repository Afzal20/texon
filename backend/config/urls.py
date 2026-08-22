from django.contrib import admin
from django.urls import path, include
from django.conf.urls import i18n
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from buyers.admin import BuyerAdmin
from buyers.models import Buyer
from authentication.views import ThrottledTokenObtainPairView
from core.sites import operations_site
from orders.admin import OrderAdmin
from orders.models import Order
from rest_framework_simplejwt.views import TokenRefreshView

# Secondary admin site (custom site) - shown in the site dropdown
operations_site.register(Buyer, BuyerAdmin)
operations_site.register(Order, OrderAdmin)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("operations/", operations_site.urls),
    path("i18n/", include(i18n)),
    path("api/v1/auth/", include("authentication.urls")),

    # Generic REST layer (docs/backend/01-rest-api-design.md) — the single API
    # gateway for all models (replaces the former GraphQL gateway).
    path("api/v1/", include("core.urls")),

    # RBAC + user management (roles.manage / users.* permission guarded).
    path("api/v1/", include("rbac.urls")),
    path("api/v1/", include("authentication.api_urls")),

    # JWT token endpoints
    path("api/users/api/token/", ThrottledTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/users/api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
