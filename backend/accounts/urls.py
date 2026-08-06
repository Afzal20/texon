from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AccountsPayableViewSet,
    AccountsReceivableViewSet,
    ChartOfAccountViewSet,
    CostCenterViewSet,
    ExpenseViewSet,
    JournalEntryViewSet,
)

router = DefaultRouter()
router.register("chart-of-accounts", ChartOfAccountViewSet, basename="chart-of-account")
router.register("journal-entries", JournalEntryViewSet, basename="journal-entry")
router.register("accounts-payable", AccountsPayableViewSet, basename="accounts-payable")
router.register("accounts-receivable", AccountsReceivableViewSet, basename="accounts-receivable")
router.register("expenses", ExpenseViewSet, basename="expense")
router.register("cost-centers", CostCenterViewSet, basename="cost-center")

urlpatterns = [
    path("", include(router.urls)),
]
