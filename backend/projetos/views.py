from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.db import transaction
from django.db.models import Max
from .models import Projeto, Coluna, Card
from .serializers import ProjetoSerializer, ColunaSerializer, CardSerializer

class ProjetoViewSet(viewsets.ModelViewSet):
    serializer_class = ProjetoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Projetos onde sou dono OU membro
        return Projeto.objects.filter(
            Q(dono=user) | Q(membros=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(dono=self.request.user)

class ColunaViewSet(viewsets.ModelViewSet):
    serializer_class = ColunaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Coluna.objects.filter(
            Q(projeto__dono=user) | Q(projeto__membros=user)
        ).distinct()

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Card.objects.all()

    def perform_create(self, serializer):
        coluna_id = self.request.data.get('coluna')
        
        # 1. Busca qual é o maior número de 'ordem' que já existe nessa coluna
        # O aggregate retorna algo tipo: {'ordem__max': 5}
        maior_ordem_atual = Card.objects.filter(coluna_id=coluna_id).aggregate(Max('ordem'))['ordem__max']
        
        # 2. Se não tiver nenhum card (None), a ordem é 1.
        # Se tiver (ex: 5), a nova ordem será 6.
        nova_ordem = (maior_ordem_atual if maior_ordem_atual is not None else 0) + 1
        
        # 3. Salva o card com essa nova ordem calculada
        serializer.save(ordem=nova_ordem)

    def get_queryset(self):
        # Filtra apenas cards dos projetos que o usuário participa
        return Card.objects.filter(
            Q(coluna__projeto__membros=self.request.user) |
            Q(coluna__projeto__dono=self.request.user)
        ).distinct()

    # --- AÇÃO DE MOVER (Drag & Drop Vertical) ---
    # Mantivemos essa função pois ela organiza a ordem dos cards
    @action(detail=True, methods=['post'])
    def mover(self, request, pk=None):
        card = self.get_object()
        
        # Dados que o Frontend manda
        nova_coluna_id = request.data.get('coluna_id')
        
        try:
            nova_posicao = int(request.data.get('nova_posicao'))
        except (TypeError, ValueError):
            return Response({'error': 'Posição inválida'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. Atualiza a coluna do card (se mudou)
                if nova_coluna_id and int(nova_coluna_id) != card.coluna.id:
                    card.coluna_id = nova_coluna_id
                    card.save()

                # 2. Pega todos os cards da coluna de destino, ordenados
                cards_na_coluna = list(Card.objects.filter(coluna=card.coluna).exclude(id=card.id).order_by('ordem'))
                
                # 3. Insere o card na posição desejada
                posicao_real = min(nova_posicao, len(cards_na_coluna))
                cards_na_coluna.insert(posicao_real, card)

                # 4. Salva a nova ordem de todos os vizinhos
                for index, c in enumerate(cards_na_coluna):
                    c.ordem = index
                    c.save(update_fields=['ordem'])

            return Response({'status': 'Card movido com sucesso'})
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # REMOVIDO: O método 'refinar' foi deletado daqui.
    # Agora o Frontend chama direto '/api/ai/run/' que está no outro arquivo (ai_engine/views.py)