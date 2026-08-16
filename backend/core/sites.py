from django.urls import path

from unfold.sites import UnfoldAdminSite

from core.admin_pages import CrispyDemoPage, ReportsPage


class TexonAdminSite(UnfoldAdminSite):
    """Main admin site - custom UnfoldAdminSite with a dashboard and custom pages."""

    index_template = "admin/dashboard.html"

    def extra_urls(self):
        return [
            path("reports/", ReportsPage.as_view(admin_site=self), name="reports"),
            path(
                "crispy-demo/",
                CrispyDemoPage.as_view(admin_site=self),
                name="crispy-demo",
            ),
        ]


class OperationsAdminSite(UnfoldAdminSite):
    """Secondary admin site - shown in the site dropdown."""


# Secondary site (custom site), models are registered in config/urls.py
operations_site = OperationsAdminSite(name="operations")
