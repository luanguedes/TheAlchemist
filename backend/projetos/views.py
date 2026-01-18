from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.db import transaction
from ai_engine.logic import transmutar_ideia # Importando a IA do outro app
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
    queryset = Card.objects.all()

    def get_queryset(self):
        # Filtra apenas cards dos projetos que o usuário participa
        return Card.objects.filter(coluna__projeto__membros=self.request.user) | \
               Card.objects.filter(coluna__projeto__dono=self.request.user)

    # --- AÇÃO DE MOVER (Drag & Drop) ---
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

                # 4. Salva a nova ordem
                for index, c in enumerate(cards_na_coluna):
                    c.ordem = index
                    c.save(update_fields=['ordem'])

            return Response({'status': 'Card movido com sucesso'})
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # --- NOVA AÇÃO: REFINAR COM IA (TheAlchemist) ---
    @action(detail=True, methods=['post'])
    def refinar(self, request, pk=None):
        card = self.get_object()
        
        print(f"🔮 Transmutando card {card.id}: {card.conteudo_original}...")
        
        # Chama a função lógica que está no app 'ai_engine'
        resultado_ai = transmutar_ideia(card.conteudo_original)
        
        # Salva o resultado no banco
        card.prompt_refinado = resultado_ai
        card.save()
        
        return Response({
            'status': 'Transmutação completa',
            'prompt_refinado': resultado_ai
        })