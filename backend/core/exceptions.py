from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is not None:
        detail = response.data
        code = response.status_code
        message = _safe_message(code)
        errors = None

        if isinstance(detail, dict):
            if "detail" in detail:
                message = detail.pop("detail")
            if detail:
                errors = detail
        elif isinstance(detail, list):
            message = str(detail[0]) if detail else message
            errors = detail

        response.data = {
            "error": {
                "code": code,
                "message": message,
                "details": errors,
            }
        }
    else:
        # 500 that DRF didn't handle — return safe shape
        response = Response(
            {
                "error": {
                    "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "message": "An internal server error occurred.",
                    "details": None,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _safe_message(code):
    messages = {
        400: "Bad request.",
        401: "Authentication credentials were not provided.",
        403: "You do not have permission to perform this action.",
        404: "Not found.",
        405: "Method not allowed.",
        415: "Unsupported media type.",
        429: "Too many requests. Please try again later.",
        500: "An internal server error occurred.",
    }
    return messages.get(code, "An error occurred.")
