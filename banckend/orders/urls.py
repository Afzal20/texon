from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuyerViewSet, PurchaseOrderViewSet

router = DefaultRouter()
router.register(r'buyers', BuyerViewSet, basename='buyer')
router.register(r'orders', PurchaseOrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
