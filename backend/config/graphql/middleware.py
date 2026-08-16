"""JWT + session authentication middleware for the GraphQL gateway.

Accepts either:
  * an ``Authorization: Bearer <access_token>`` JWT header, or
  * an authenticated Django session (e.g. logged into the admin for GraphiQL).

Every GraphQL request is rejected with the documented error message when no
valid authentication is present.
"""

import logging

from graphql import GraphQLError
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

AUTH_ERROR_MESSAGE = (
    "Authentication required. Please provide a valid 'Authorization: Bearer <token>' header."
)


class JWTAuthMiddleware:
    def resolve(self, next, root, info, **args):
        request = info.context
        user = getattr(request, "user", None)

        if user is None or not user.is_authenticated:
            user = None
            try:
                result = JWTAuthentication().authenticate(request)
                if result is not None:
                    user, _ = result
                    request.user = user
            except Exception:  # invalid/expired/malformed token
                user = None

        if user is None or not user.is_authenticated:
            logger.warning("GraphQL request rejected: missing or invalid authentication")
            raise GraphQLError(AUTH_ERROR_MESSAGE)

        return next(root, info, **args)