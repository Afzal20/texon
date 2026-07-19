from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"buyer-communications", views.BuyerCommunicationViewSet, basename="buyer-communication")
router.register(r"buyer-profitabilities", views.BuyerProfitabilityViewSet, basename="buyer-profitability")
router.register(r"order-amendment-histories", views.OrderAmendmentHistoryViewSet, basename="order-amendment-history")

urlpatterns = router.urls
