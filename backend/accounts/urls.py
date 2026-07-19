from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"chart-of-accounts", views.ChartOfAccountViewSet)
router.register(r"journal-entries", views.JournalEntryViewSet)
router.register(r"accounts-payable", views.AccountsPayableViewSet)
router.register(r"accounts-receivable", views.AccountsReceivableViewSet)
router.register(r"expenses", views.ExpenseViewSet)
router.register(r"cost-centers", views.CostCenterViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
