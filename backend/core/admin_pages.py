import json

from django import forms
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.shortcuts import render
from django.views import View

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Column, Div, Fieldset, Layout, Row, Submit

from core.log_buffer import handler as log_buffer_handler
from unfold.layout import FieldsetSubheader, Hr
from unfold.views import UnfoldSiteViewMixin


class BuyerEnquiryForm(forms.Form):
    """Demo form rendered with django-crispy-forms using the unfold_crispy template pack."""

    company = forms.CharField(
        label="Company", max_length=255, help_text="Name of the buying company."
    )
    contact_person = forms.CharField(label="Contact person", max_length=255)
    email = forms.EmailField(label="Email")
    phone = forms.CharField(label="Phone", required=False)
    country = forms.ChoiceField(
        label="Country",
        choices=[
            ("bd", "Bangladesh"),
            ("gb", "United Kingdom"),
            ("us", "United States"),
            ("de", "Germany"),
        ],
    )
    order_quantity = forms.IntegerField(label="Estimated order quantity", min_value=0)
    notes = forms.CharField(label="Notes", widget=forms.Textarea, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_method = "post"
        self.helper.form_action = "."
        self.helper.layout = Layout(
            FieldsetSubheader("Contact information"),
            Row(
                Column("company", css_class="form-group col-6"),
                Column("contact_person", css_class="form-group col-6"),
            ),
            Row(
                Column("email", css_class="form-group col-6"),
                Column("phone", css_class="form-group col-6"),
            ),
            Hr(),
            FieldsetSubheader("Order details"),
            Row(
                Column("country", css_class="form-group col-6"),
                Column("order_quantity", css_class="form-group col-6"),
            ),
            Div("notes", css_class="mt-4"),
            Submit("submit", "Submit enquiry"),
        )


class BaseAdminPage(UnfoldSiteViewMixin, View):
    """UnfoldSiteViewMixin already provides PermissionRequiredMixin."""

    def has_permission(self):
        return self.request.user.is_staff

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, self.get_context_data(**kwargs))


class ReportsPage(BaseAdminPage):
    title = "Reports"
    template_name = "admin/pages/reports.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["stats"] = {
            "buyers": {"count": 24, "delta": "+12.5%"},
            "orders": {"count": 1_240, "delta": "+8.2%"},
            "production": {"count": 86, "delta": "-3.1%"},
            "revenue": {"count": "$2.4M", "delta": "+15.0%"},
        }
        # Charts are rendered client-side, data must be serialized JSON
        context["chart_data"] = json.dumps(
            {
                "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                "datasets": [
                    {
                        "label": "Orders",
                        "data": [82, 96, 110, 128, 141, 156, 170],
                        "borderColor": "#10b981",
                    },
                    {
                        "label": "Deliveries",
                        "data": [70, 88, 104, 119, 132, 148, 161],
                        "borderColor": "#6366f1",
                    },
                ],
            }
        )
        return context


class CrispyDemoPage(BaseAdminPage):
    title = "Crispy Form Demo"
    template_name = "admin/pages/crispy_demo.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = BuyerEnquiryForm()
        return context

    def post(self, request, *args, **kwargs):
        form = BuyerEnquiryForm(request.POST)
        context = self.get_context_data(**kwargs)
        context["form"] = form
        context["submitted"] = form.is_valid()
        if form.is_valid():
            context["cleaned_data"] = form.cleaned_data
        return render(request, self.template_name, context)


LEVEL_CHOICES = [
    ("", "All levels"),
    ("DEBUG", "DEBUG"),
    ("INFO", "INFO"),
    ("WARNING", "WARNING"),
    ("ERROR", "ERROR"),
    ("CRITICAL", "CRITICAL"),
]

PAGE_SIZE = 50


class LogsPage(BaseAdminPage):
    """Admin panel page showing the most recent application log records.

    Backed by the in-memory ring buffer (core/log_buffer.py) wired into the
    LOGGING settings - no log files required (works on serverless hosts).
    Superusers only.
    """

    title = "Logs"
    template_name = "admin/pages/logs.html"

    def has_permission(self):
        return self.request.user.is_active and self.request.user.is_superuser

    def _filtered_entries(self):
        entries = log_buffer_handler.snapshot()  # newest first

        level = self.request.GET.get("level", "")
        logger_name = self.request.GET.get("logger", "").strip().lower()
        query = self.request.GET.get("q", "").strip().lower()

        if level:
            order = {name: i for i, (name, _) in enumerate(LEVEL_CHOICES[1:])}
            min_no = order.get(level, 0)
            entries = [
                e for e in entries if order.get(e["level"], 0) >= min_no
            ]
        if logger_name:
            entries = [e for e in entries if logger_name in e["logger"].lower()]
        if query:
            entries = [
                e
                for e in entries
                if query in e["message"].lower()
                or query in e["logger"].lower()
                or query in e["module"].lower()
            ]
        return entries

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        entries = self._filtered_entries()

        paginator = Paginator(entries, PAGE_SIZE)
        page_number = self.request.GET.get("page", 1)
        try:
            page_obj = paginator.page(page_number)
        except (PageNotAnInteger, EmptyPage):
            page_obj = paginator.page(1)

        counts = log_buffer_handler.counts_by_level()

        # Preserve active filters across pagination links
        querystring = self.request.GET.copy()
        querystring.pop("page", None)

        context.update(
            {
                "page_obj": page_obj,
                "levels": LEVEL_CHOICES,
                "selected_level": self.request.GET.get("level", ""),
                "logger_filter": self.request.GET.get("logger", ""),
                "query": self.request.GET.get("q", ""),
                "total_buffered": sum(counts.values()),
                "counts": {
                    "errors": counts.get("ERROR", 0) + counts.get("CRITICAL", 0),
                    "warnings": counts.get("WARNING", 0),
                },
                "querystring": querystring.urlencode(),
            }
        )
        return context

    def post(self, request, *args, **kwargs):
        """POST clears the in-memory buffer."""
        log_buffer_handler.clear()
        return self.get(request, *args, **kwargs)
