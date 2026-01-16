from rest_framework import viewsets
from django.contrib.auth.models import User
from .models import Projeto, Coluna, Card
from .serializers import ProjetoSerializer, ColunaSerializer, CardSerializer

class ProjetoViewSet(viewsets.ModelViewSet):
    # Mudança 1: Pegar TODOS os projetos, sem filtrar por usuário
    queryset = Projeto.objects.all()
    serializer_class = ProjetoSerializer
    
    def perform_create(self, serializer):
        # Mudança 2: Como não tem login, atribuímos o projeto ao Admin (User ID 1)
        # ou ao primeiro usuário que encontrar no banco
        admin_user = User.objects.first()
        serializer.save(dono=admin_user)

class ColunaViewSet(viewsets.ModelViewSet):
    queryset = Coluna.objects.all()
    serializer_class = ColunaSerializer

class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer