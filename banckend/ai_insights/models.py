from django.db import models
from auditlog.registry import auditlog

class MLModel(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="ml_models")
    name = models.CharField(max_length=255)  # ResNet-152, Optimization Model v3.2
    version = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    performance_metrics = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (v{self.version})"

class Prediction(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="predictions")
    ml_model = models.ForeignKey(MLModel, on_delete=models.CASCADE)
    target_object_id = models.CharField(max_length=100)  # ID or SKU reference
    prediction_type = models.CharField(max_length=100)  # delay_risk, efficiency, stock_out
    prediction_value = models.DecimalField(max_digits=5, decimal_places=2)  # Delay risk percentage, etc.
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prediction: {self.prediction_type} ({self.prediction_value}%)"

class Insight(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name="insights")
    title = models.CharField(max_length=255)
    description = models.TextField()
    insight_type = models.CharField(max_length=100)  # bottleneck, stock_warning, optimization
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Recommendation(models.Model):
    insight = models.ForeignKey(Insight, on_delete=models.CASCADE, related_name="recommendations")
    action_description = models.TextField()
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2)
    is_executed = models.BooleanField(default=False)
    executed_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    executed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Rec for: {self.insight.title} ({self.confidence_score}%)"

class CommandHistory(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name="ai_commands")
    command_text = models.TextField()  # Natural language command
    response_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cmd: {self.user.email} - {self.timestamp}"

class QueryTemplate(models.Model):
    title = models.CharField(max_length=255)  # Suggested query title
    natural_language_query = models.TextField()
    sql_template = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

auditlog.register(MLModel)
auditlog.register(Prediction)
auditlog.register(Insight)
auditlog.register(Recommendation)
auditlog.register(CommandHistory)
auditlog.register(QueryTemplate)
