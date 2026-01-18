from rest_framework import serializers
from .models import Projeto, Coluna, Card

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = '__all__' # Garante que 'coluna' seja aceito na criação

class ColunaSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    class Meta:
        model = Coluna
        # ADICIONADO 'projeto' AQUI EMBAIXO:
        fields = ['id', 'titulo', 'ordem', 'cards', 'projeto']

class ProjetoSerializer(serializers.ModelSerializer):
    colunas = ColunaSerializer(many=True, read_only=True)
    
    is_dono = serializers.SerializerMethodField()
    total_membros = serializers.SerializerMethodField()
    nome_dono = serializers.CharField(source='dono.username', read_only=True)

    class Meta:
        model = Projeto
        fields = [
            'id', 
            'titulo', 
            'descricao', 
            'arquivado', 
            'criado_em', 
            'colunas', 
            'dono', 
            'nome_dono', 
            'is_dono',
            'total_membros'
        ]
        read_only_fields = ['dono']

    def get_is_dono(self, obj):
        try:
            user = self.context['request'].user
            return obj.dono == user
        except:
            return False

    def get_total_membros(self, obj):
        return obj.membros.count() + 1