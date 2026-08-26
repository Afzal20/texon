from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        # OWASP A09: auth lifecycle audit logging.
        from core import security_logging

        security_logging.connect()

        # OWASP A05: production misconfiguration warnings. Importing the
        # module registers the check with Django's check framework.
        from core import checks  # noqa: F401
