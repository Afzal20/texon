"""System checks enforcing the OWASP Top 10 security policy (A05/A02).

Run automatically with every ``manage.py check``/``migrate``/``runserver``
and at boot on deployment. Each finding has a stable id (texon.W0xx) so
monitoring can alert on specific misconfigurations.
"""
from django.conf import settings
from django.core import checks


def _w(id_, msg):
    return checks.Warning(msg, id=id_)


@checks.register("security")
def production_security_check(app_configs=None, **kwargs):
    findings = []

    if not settings.DEBUG:
        if "*" in settings.ALLOWED_HOSTS:
            findings.append(_w(
                "texon.W001",
                "ALLOWED_HOSTS contains '*' - host header spoofing/cache "
                "poisoning possible. List explicit domains instead.",
            ))
        if getattr(settings, "CORS_ALLOW_ALL_ORIGINS", False):
            findings.append(_w(
                "texon.W002",
                "CORS_ALLOW_ALL_ORIGINS=True with CORS_ALLOW_CREDENTIALS=True "
                "lets any origin make authenticated calls. Set explicit origins.",
            ))
        if "insecure" in settings.SECRET_KEY:
            findings.append(_w(
                "texon.W003",
                "SECRET_KEY looks like the development default - rotate it.",
            ))
        if not getattr(settings, "SECURE_SSL_REDIRECT", False):
            findings.append(_w(
                "texon.W004",
                "SECURE_SSL_REDIRECT is disabled in production; plain-HTTP "
                "requests are not upgraded to HTTPS.",
            ))
        if getattr(settings, "SECURE_HSTS_SECONDS", 0) < 31536000:
            findings.append(_w(
                "texon.W005",
                "HSTS max-age below one year (SECURE_HSTS_SECONDS).",
            ))

    return findings
