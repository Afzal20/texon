import math

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ProductionPagination(PageNumberPagination):
    """
    Standard pagination for all production endpoints.

    - Default page size: 50
    - Client-adjustable via `?page_size=` query param
    - Hard cap at 200 to prevent abuse
    - Response includes extra metadata (total_pages, current_page, total_count)
    """

    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200

    def get_paginated_response(self, data):
        total_count = self.page.paginator.count
        page_size = self.get_page_size(self.request) or self.page_size
        total_pages = math.ceil(total_count / page_size) if page_size else 1

        return Response(
            {
                "count": total_count,
                "total_pages": total_pages,
                "current_page": self.page.number,
                "page_size": page_size,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )

    def get_paginated_response_schema(self, schema):
        """Schema override for drf-spectacular."""
        return {
            "type": "object",
            "required": ["count", "results"],
            "properties": {
                "count": {"type": "integer", "example": 123},
                "total_pages": {"type": "integer", "example": 3},
                "current_page": {"type": "integer", "example": 1},
                "page_size": {"type": "integer", "example": 50},
                "next": {
                    "type": "string",
                    "nullable": True,
                    "format": "uri",
                    "example": "http://api.example.org/production/units/?page=2",
                },
                "previous": {
                    "type": "string",
                    "nullable": True,
                    "format": "uri",
                    "example": None,
                },
                "results": schema,
            },
        }
