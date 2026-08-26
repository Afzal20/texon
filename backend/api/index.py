"""
Vercel serverless entry point.

Vercel's Python runtime looks for an `app` (WSGI) variable in files under
`api/`. We re-export the Django WSGI application so every request is routed
to Django via the rewrite rule in vercel.json.
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402
from django.conf import settings  # noqa: E402

django.setup()

# Serverless lambdas start from a read-only code bundle, so `collectstatic`
# cannot run at build time. Instead, populate the ephemeral static root
# (/tmp/staticfiles, see settings.py) once per instance BEFORE the WSGI app
# initialises, so WhiteNoise can serve admin/API-documentation assets.
if os.environ.get("VERCEL") == "1" and not os.path.isdir(settings.STATIC_ROOT):
    from django.core.management import call_command

    call_command("collectstatic", interactive=False, verbosity=0)

from config.wsgi import application  # noqa: E402

app = application