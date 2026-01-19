from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings

# --- NOVA BIBLIOTECA DO GOOGLE (2026) ---
from google import genai
from google.genai import types

# Importar modelos
from projetos.models import Card
from .models import AgenteIA
from .serializers import AgenteIASerializer

class RunAIActionView(APIView):
    """
    Executa um Agente de IA em um card específico.
    Recebe: { "card_id": 1, "agente_id": 3 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 1. Validação da API Key
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            return Response(
                {"error": "API Key do Gemini não configurada no servidor (.env)."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        card_id = request.data.get('card_id')
        agente_id = request.data.get('agente_id')

        if not card_id or not agente_id:
            return Response(
                {"error": "Parâmetros 'card_id' e 'agente_id' são obrigatórios."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Busca os dados no banco
        card = get_object_or_404(Card, id=card_id)
        agente = get_object_or_404(AgenteIA, id=agente_id)

        # 3. Monta o prompt (Persona + Tarefa)
        full_prompt = (
            f"--- PERSONA / AGENTE ---\n"
            f"{agente.prompt_sistema}\n\n"
            f"--- DADOS DO USUÁRIO (Contexto Real) ---\n"
            f"Título Principal: {card.titulo}\n"
            f"Descrição Detalhada/Input: {card.conteudo_original}\n\n"
            f"--- INSTRUÇÕES DE SAÍDA ---\n"
            f"1. Analise o Título E a Descrição Detalhada para compor sua resposta.\n"
            f"2. IMPORTANTE: Entregue APENAS o resultado final (o prompt refinado, o código, ou o texto solicitado).\n"
            f"3. NÃO inclua 'Persona', 'Contexto', 'Objetivo' ou explicações sobre sua estrutura lógica.\n"
            f"4. Quero apenas o texto pronto para ser copiado e usado.\n\n"
            f"--- SUA RESPOSTA FINAL ---"
        )

        try:
            # 4. Configura o Cliente (Nova Sintaxe)
            client = genai.Client(api_key=api_key)

            # 5. Chama a IA
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=agente.temperatura
                )
            )
            
            ai_text = response.text

            # 6. Lógica de Salvamento Inteligente
            nome_agente = agente.nome.lower()
            if any(x in nome_agente for x in ["refinador", "arquiteto", "engenheiro"]):
                card.prompt_refinado = ai_text
                card.save()

            return Response({
                "result": ai_text,
                "agente_usado": agente.nome
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"ERRO GEMINI: {str(e)}") 
            return Response(
                {"error": f"Erro na execução da IA: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AgenteIAViewSet(viewsets.ModelViewSet):
    """
    CRUD para gerenciar os Agentes (Personas) pelo Frontend.
    """
    queryset = AgenteIA.objects.all()
    serializer_class = AgenteIASerializer
    permission_classes = [permissions.IsAuthenticated]