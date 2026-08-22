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
        self._align_admin_model_names()

    @staticmethod
    def _align_admin_model_names():
        """Make the admin panel display the EXACT Django model class names
        (e.g. "ProductionLine", "SewingRecord") instead of the spaced
        verbose_name labels ("Production Line", "Sewing Record"), so the
        admin panel matches the frontend 1:1."""
        from django.apps import apps

        from core.api import PROJECT_APPS

        for app_label in PROJECT_APPS:
            try:
                app_config = apps.get_app_config(app_label)
            except LookupError:
                continue
            for model in app_config.get_models():
                name = model.__name__
                model._meta.verbose_name = name
                model._meta.verbose_name_plural = name if name.endswith("s") else f"{name}s"
