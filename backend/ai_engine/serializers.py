from rest_framework import serializers
from .models import AgenteIA

class AgenteIASerializer(serializers.ModelSerializer):
    class Meta:
        model = AgenteIA
        fields = '__all__'