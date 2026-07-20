from django.db import models
from django.conf import settings

class ConversationLog(models.Model):
    conversation_id = models.CharField(max_length=255, editable=False)
    user = models.IntegerField(editable=False)
    messages = models.CharField(editable=False)
    message_count = models.IntegerField(editable=False)
    organization = models.ForeignKey(
        'core.Organization',
        on_delete=models.CASCADE,
        related_name='conversation_log_set',
    )

    class Meta:
        db_table = 'conversation_log'
        verbose_name = 'ConversationLog'
        verbose_name_plural = 'ConversationLogs'

