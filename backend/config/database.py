"""Explicit PostgreSQL configuration with a development-only SQLite fallback."""

from urllib.parse import urlsplit

import dj_database_url
from django.core.exceptions import ImproperlyConfigured


def database_config(*, url, base_dir, debug):
    url = url.strip()
    if not url:
        if debug:
            return {"ENGINE": "django.db.backends.sqlite3", "NAME": base_dir / "db.sqlite3"}
        raise ImproperlyConfigured("DATABASE_URL is required when DJANGO_DEBUG=False.")
    try:
        if urlsplit(url).scheme not in {"postgres", "postgresql"}:
            raise ValueError("Unsupported database scheme")
        result = dj_database_url.parse(url, conn_max_age=0, conn_health_checks=True)
        if not result.get("NAME"):
            raise ValueError("A database name is required")
    except (ValueError, TypeError):
        # URL parsing exceptions can contain passwords; expose only safe text.
        raise ImproperlyConfigured("DATABASE_URL must be a valid PostgreSQL URL with a database name.") from None
    # Django recommends disabling persistent connections under ASGI. Keep
    # this invariant even when a URL includes a conn_max_age query parameter.
    result["CONN_MAX_AGE"] = 0
    result.setdefault("OPTIONS", {}).setdefault("connect_timeout", 5)
    return result
