class OwnerQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_staff:
            return qs
        filter_field = getattr(self, "owner_filter_field", "user")
        return qs.filter(**{filter_field: user})
