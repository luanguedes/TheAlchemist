from django.contrib import admin
from .models import ActionTemplate

@admin.register(ActionTemplate)
class ActionTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'active')