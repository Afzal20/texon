from allauth.socialaccount.providers.oauth2.client import OAuth2Client
import inspect
print(inspect.signature(OAuth2Client.get_redirect_url))
