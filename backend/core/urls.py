from rest_framework.routers import DefaultRouter

from .api import get_registry

router = DefaultRouter()
for slug, viewset in get_registry().items():
    router.register(slug, viewset, basename=slug)

urlpatterns = router.urls
