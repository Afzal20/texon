"""URL routes for the AI application."""

from django.urls import path

from ai.views import AIChatView

app_name = 'ai'

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='chat'),
]
