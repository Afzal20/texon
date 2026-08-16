from django.contrib import admin
from django.urls import path, include
from django.conf.urls import i18n
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from buyers.admin import BuyerAdmin
from buyers.models import Buyer
from core.sites import operations_site
from orders.admin import OrderAdmin
from orders.models import Order

# Secondary admin site (custom site) - shown in the site dropdown
operations_site.register(Buyer, BuyerAdmin)
operations_site.register(Order, OrderAdmin)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("operations/", operations_site.urls),
    path("i18n/", include(i18n)),
    path("api/v1/auth/", include("authentication.urls")),
    path("api/v1/accounts/", include("accounts.urls")),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
