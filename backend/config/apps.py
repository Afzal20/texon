from django.contrib import admin
from django.contrib.admin import sites
from django.contrib.admin.apps import AdminConfig


class TexonAdminConfig(AdminConfig):
    """Replaces django.contrib.admin with the Unfold-based TexonAdminSite."""

    default_site = "core.sites.TexonAdminSite"

    def ready(self):
        # unfold's DefaultAppConfig.ready() assigns a plain UnfoldAdminSite to
        # admin.site - swap it for our subclass before autodiscovery so all
        # @admin.register decorators land on the custom site.
        from core.sites import TexonAdminSite

        site = TexonAdminSite()
        admin.site = site
        sites.site = site

        super().ready()
