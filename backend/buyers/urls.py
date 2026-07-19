from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"buyers", views.BuyerViewSet, basename="buyer")
router.register(r"buyer-ratings", views.BuyerRatingViewSet, basename="buyer-rating")
router.register(r"buyer-portfolios", views.BuyerPortfolioViewSet, basename="buyer-portfolio")

urlpatterns = router.urls
