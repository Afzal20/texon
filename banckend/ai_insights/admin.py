from django.contrib import admin
from .models import MLModel, Prediction, Insight, Recommendation, CommandHistory, QueryTemplate

@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'is_active', 'organization')
    search_fields = ('name',)
    list_filter = ('organization', 'is_active')

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('ml_model', 'target_object_id', 'prediction_type', 'prediction_value', 'confidence_score', 'organization')
    search_fields = ('target_object_id', 'prediction_type')
    list_filter = ('organization', 'prediction_type')

class RecommendationInline(admin.TabularInline):
    model = Recommendation
    extra = 1

@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ('title', 'insight_type', 'created_at', 'organization')
    search_fields = ('title', 'insight_type')
    list_filter = ('organization', 'insight_type')
    inlines = [RecommendationInline]

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('insight', 'confidence_score', 'is_executed', 'executed_by', 'executed_at')
    search_fields = ('action_description',)
    list_filter = ('is_executed',)

@admin.register(CommandHistory)
class CommandHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'command_text', 'timestamp')
    search_fields = ('user__email', 'command_text')
    list_filter = ('timestamp',)

@admin.register(QueryTemplate)
class QueryTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'natural_language_query')
    search_fields = ('title', 'natural_language_query')
