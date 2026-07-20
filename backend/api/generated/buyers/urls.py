from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'buyer-communications', views.BuyerViewSet, basename='buyer-communications')
router.register(r'buyer-portfolios', views.BuyerPortfolioViewSet, basename='buyer-portfolios')
router.register(r'buyer-ratings', views.BuyerRatingViewSet, basename='buyer-ratings')

urlpatterns = router.urls