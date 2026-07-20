from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'buyer-communications', views.BuyerCommunicationViewSet, basename='buyer-communications')
router.register(r'buyer-profitabilities', views.BuyerProfitabilityViewSet, basename='buyer-profitabilities')
router.register(r'order-amendment-histories', views.OrderAmendmentHistoryViewSet, basename='order-amendment-histories')

urlpatterns = router.urls