import django_filters
from .models import Notification

class NotificationFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Notification
        fields = ['title', 'is_read']
