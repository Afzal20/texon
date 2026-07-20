from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'accounts-payable', views.AccountsPayableViewSet, basename='accounts-payable')
router.register(r'accounts-receivable', views.AccountsReceivableViewSet, basename='accounts-receivable')
router.register(r'chart-of-accounts', views.ChartOfAccountViewSet, basename='chart-of-accounts')
router.register(r'cost-centers', views.CostCenterViewSet, basename='cost-centers')
router.register(r'expenses', views.ExpenseViewSet, basename='expenses')
router.register(r'invoices', views.InvoiceViewSet, basename='invoices')
router.register(r'journal-entries', views.JournalEntryViewSet, basename='journal-entries')

urlpatterns = router.urls