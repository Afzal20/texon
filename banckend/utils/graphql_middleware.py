from graphql import GraphQLError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthMiddleware:
    """
    GraphQL Middleware to enforce JWT authentication on all requests.
    Extracts the token from the HTTP_AUTHORIZATION header, validates it,
    and attaches the authenticated user to `info.context.user`.
    """
    def resolve(self, next, root, info, **args):
        request = info.context

        # If user is already authenticated (e.g., via session auth in admin), allow it
        if hasattr(request, 'user') and request.user.is_authenticated:
            return next(root, info, **args)

        # Extract Authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            raise GraphQLError("Authentication required. Please provide a valid 'Authorization: Bearer <token>' header.")

        try:
            # Validate JWT
            jwt_auth = JWTAuthentication()
            token = auth_header.split(" ")[1]
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
        except (InvalidToken, TokenError) as e:
            raise GraphQLError(f"Invalid or expired token: {str(e)}")
        except Exception as e:
            raise GraphQLError("Authentication failed.")

        if not user.is_active:
            raise GraphQLError("User account is disabled.")

        # Attach authenticated user to the context
        request.user = user

        return next(root, info, **args)
