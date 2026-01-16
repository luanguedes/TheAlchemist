from rest_framework import serializers
from .models import Projeto, Coluna, Card

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = '__all__'

class ColunaSerializer(serializers.ModelSerializer):
    # Inclui os cards dentro da coluna automaticamente para facilitar o frontend
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = Coluna
        fields = ['id', 'titulo', 'ordem', 'cor', 'projeto', 'cards']

class ProjetoSerializer(serializers.ModelSerializer):
    # Inclui as colunas dentro do projeto
    colunas = ColunaSerializer(many=True, read_only=True)
    is_dono = serializers.SerializerMethodField()
    total_membros = serializers.SerializerMethodField()
    nome_dono = serializers.CharField(source='dono.username', read_only=True)

    class Meta:
        model = Projeto
        fields = ['id', 'titulo', 'descricao', 'arquivado', 'criado_em', 'colunas', 'dono']
        read_only_fields = ['dono'] # O dono é definido automaticamente pelo login
        
    def get_is_dono(self, obj):
        # Verifica se o usuário logado é o dono
        user = self.context['request'].user
        return obj.dono == user

    def get_total_membros(self, obj):
        # Conta membros + 1 (o dono)
        return obj.membros.count() + 1