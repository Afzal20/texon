"""Security audit logging (OWASP A09: Security Logging & Monitoring Failures).

Emits structured events for the authentication lifecycle into the
``texon.security`` logger so failed logins, successful logins and logouts are
observable in production (stdout on Vercel / container logs).
"""
import logging

from django.contrib.auth import signals as auth_signals
from django.core import signals as core_signals

logger = logging.getLogger("texon.security")


def _client_ip(request):
    if request is None:
        return "-"
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "-")


def _email(credentials):
    for key in ("email", "username"):
        value = credentials.get(key)
        if value:
            return str(value)[:254]
    return "-"


def on_login_failed(sender, credentials=None, request=None, **kwargs):
    logger.warning(
        "auth.login_failed user=%s ip=%s path=%s",
        _email(credentials or {}),
        _client_ip(request),
        getattr(request, "path", "-"),
    )


def on_logged_in(sender, request=None, user=None, **kwargs):
    logger.info(
        "auth.login_ok user_id=%s email=%s ip=%s",
        getattr(user, "pk", "-"),
        getattr(user, "email", "-"),
        _client_ip(request),
    )


def on_logged_out(sender, request=None, user=None, **kwargs):
    logger.info(
        "auth.logout user_id=%s email=%s ip=%s",
        getattr(user, "pk", "-"),
        getattr(user, "email", "-"),
        _client_ip(request),
    )


def on_request_exception(sender, request=None, **kwargs):
    logger.error(
        "request.exception method=%s path=%s ip=%s",
        getattr(request, "method", "-"),
        getattr(request, "path", "-"),
        _client_ip(request),
    )


def connect():
    auth_signals.user_login_failed.connect(on_login_failed)
    auth_signals.user_logged_in.connect(on_logged_in)
    auth_signals.user_logged_out.connect(on_logged_out)
    core_signals.got_request_exception.connect(on_request_exception)
