from rest_framework import serializers
from .models import ActionTemplate

class ActionTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionTemplate
        fields = '__all__'