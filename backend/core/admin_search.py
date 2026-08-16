from django.urls import reverse_lazy

from unfold.dataclasses import SearchResult


def search_callback(request, search_term):
    """Command palette - custom search results injected into the command search."""

    results = []
    term = search_term.lower()

    pages = [
        SearchResult(
            title="Reports",
            description="Custom admin page with charts",
            link=reverse_lazy("admin:reports"),
            icon="monitoring",
        ),
        SearchResult(
            title="Crispy Form Demo",
            description="django-crispy-forms with the unfold_crispy template pack",
            link=reverse_lazy("admin:crispy-demo"),
            icon="dynamic_form",
        ),
        SearchResult(
            title="Operations Site",
            description="Secondary admin site",
            link=reverse_lazy("operations:index"),
            icon="swap_horiz",
        ),
    ]

    for page in pages:
        if term in page.title.lower() or term in page.description.lower():
            results.append(page)

    return results
