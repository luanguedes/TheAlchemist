from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Projeto, Coluna, Card
from .serializers import ProjetoSerializer, ColunaSerializer, CardSerializer

class ProjetoViewSet(viewsets.ModelViewSet):
    serializer_class = ProjetoSerializer
    # Agora EXIGIMOS login para saber separar "meus" vs "compartilhados"
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # A Mágica: Traz projetos onde sou Dono (dono=user)
        # OU (|) onde fui convidado (membros=user)
        return Projeto.objects.filter(
            Q(dono=user) | Q(membros=user)
        ).distinct()

    def perform_create(self, serializer):
        # Define o dono como o usuário que está logado
        serializer.save(dono=self.request.user)

class ColunaViewSet(viewsets.ModelViewSet):
    serializer_class = ColunaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Só mostra colunas de projetos que eu tenho acesso
        user = self.request.user
        return Coluna.objects.filter(
            Q(projeto__dono=user) | Q(projeto__membros=user)
        ).distinct()

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Só mostra cards de projetos que eu tenho acesso
        user = self.request.user
        return Card.objects.filter(
            Q(coluna__projeto__dono=user) | Q(coluna__projeto__membros=user)
        ).distinct()