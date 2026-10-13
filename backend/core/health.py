"""Minimal public process/database probes; no ERP data or credentials."""

from django.db import DatabaseError, connection
from django.http import JsonResponse
from django.views.decorators.http import require_safe


def _response(data, status=200):
    response = JsonResponse(data, status=status)
    response["Cache-Control"] = "no-store"
    return response


@require_safe
def liveness(request):
    return _response({"status": "ok"})


@require_safe
def readiness(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            if cursor.fetchone() != (1,):
                return _response({"status": "unavailable"}, status=503)
    except DatabaseError:
        return _response({"status": "unavailable"}, status=503)
    return _response({"status": "ok"})
