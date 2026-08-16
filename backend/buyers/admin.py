from django.contrib import admin

from unfold.admin import ModelAdmin
from unfold.datasets import BaseDataset
from unfold.decorators import display
from unfold.paginator import InfinitePaginator
from unfold.sections import TableSection, TemplateSection

from orders.models import Order

from .models import Buyer, BuyerPortfolio, BuyerRating


# ---------------------------------------------------------------------------
# Sections (expandable rows) - rendered inside the Buyer changelist
# ---------------------------------------------------------------------------


class OrdersSection(TableSection):
    """Expandable row showing the buyer's orders as a table."""

    related_name = "orders"
    fields = ["order_number", "order_date", "status", "quantity", "total_value"]
    verbose_name = "Orders"
    height = "h-64"


class PortfolioSection(TemplateSection):
    """Expandable row rendered from a custom template."""

    template_name = "admin/sections/buyer_portfolio.html"

    def get_context_data(self, request, instance):
        return {
            "portfolio": getattr(instance, "portfolio", None),
            "order_count": instance.orders.count(),
        }


# ---------------------------------------------------------------------------
# Datasets - changelists displayed on the Buyer change form
# ---------------------------------------------------------------------------


class OrderDatasetAdmin(ModelAdmin):
    list_display = ["order_number", "order_date", "delivery_date", "status", "quantity", "total_value"]
    list_display_links = ["order_number"]
    list_per_page = 5
    search_fields = ["order_number"]

    def get_queryset(self, request):
        obj_id = self.extra_context.get("object")

        if not obj_id:
            return super().get_queryset(request).none()

        return super().get_queryset(request).filter(buyer__pk=obj_id)


class OrderDataset(BaseDataset):
    model = Order
    model_admin = OrderDatasetAdmin
    tab = True


class PortfolioDatasetAdmin(ModelAdmin):
    list_display = ["buyer", "active_orders", "total_units", "total_value"]
    list_display_links = ["buyer"]
    list_per_page = 5

    def get_queryset(self, request):
        obj_id = self.extra_context.get("object")

        if not obj_id:
            return super().get_queryset(request).none()

        return super().get_queryset(request).filter(buyer__pk=obj_id)


class PortfolioDataset(BaseDataset):
    model = BuyerPortfolio
    model_admin = PortfolioDatasetAdmin


# ---------------------------------------------------------------------------
# Model admins
# ---------------------------------------------------------------------------


@admin.register(Buyer)
class BuyerAdmin(ModelAdmin):
    # ModelAdmin options
    list_fullwidth = True
    list_filter_sheet = True
    list_filter_submit = True
    list_filter_options = {
        "is_active": {"label": "Active status"},
        "country": {"label": "Country", "horizontal": True},
    }
    list_disable_select_all = False
    warn_unsaved_form = True
    show_change_link = True
    # Sortable changelist - drag & drop reordering
    ordering_field = "sequence"
    # Paginator - infinite scroll pagination
    paginator = InfinitePaginator
    # Sections (expandable rows) in the changelist
    list_sections = [OrdersSection, PortfolioSection]
    list_sections_classes = "lg:grid-cols-2"
    # Datasets on the change form
    change_form_datasets = [OrderDataset, PortfolioDataset]

    list_display = ("name", "code", "country", "is_active", "sequence")
    search_fields = ("name", "code", "country")
    list_filter = ("is_active", "country")
    list_per_page = 25

    @display(description="Portfolio")
    def portfolio_value(self, obj):
        portfolio = getattr(obj, "portfolio", None)
        return portfolio.total_value if portfolio else "-"

    @display(description="Orders")
    def order_count(self, obj):
        return obj.orders.count()


@admin.register(BuyerRating)
class BuyerRatingAdmin(ModelAdmin):
    list_fullwidth = True
    list_filter_submit = True
    list_display = ("buyer", "rating", "reviews_count", "updated_at")
    search_fields = ("buyer__name",)
    paginator = InfinitePaginator


@admin.register(BuyerPortfolio)
class BuyerPortfolioAdmin(ModelAdmin):
    list_fullwidth = True
    list_filter_sheet = True
    list_display = ("buyer", "active_orders", "total_units", "total_value", "updated_at")
    search_fields = ("buyer__name",)
