from django.contrib import admin
from django.urls import path, include
from django.conf.urls import i18n
from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from buyers.admin import BuyerAdmin
from buyers.models import Buyer
from config.graphql.middleware import JWTAuthMiddleware
from config.graphql.schema import schema
from core.sites import operations_site
from graphene_django.views import GraphQLView
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

    # GraphQL gateway (frontend_graphql_guide.md)
    path(
        "graphql/",
        csrf_exempt(GraphQLView.as_view(graphiql=True, schema=schema, middleware=[JWTAuthMiddleware()])),
        name="graphql",
    ),
    # JWT token endpoint documented in the GraphQL guide
    path("api/users/api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/users/api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
