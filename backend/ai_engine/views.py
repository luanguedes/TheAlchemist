from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings
import google.generativeai as genai

# Importar modelos
from projetos.models import Card
from .models import AgenteIA
from .serializers import AgenteIASerializer

# Configuração Inicial do Gemini
if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class RunAIActionView(APIView):
    """
    Executa um Agente de IA em um card específico.
    Recebe: { "card_id": 1, "agente_id": 3 }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 1. Validação da API Key
        if not getattr(settings, 'GEMINI_API_KEY', None):
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

        # 3. Prepara o modelo com a temperatura do agente
        generation_config = genai.types.GenerationConfig(
            temperature=agente.temperatura
        )
        
        # MODELO ATUALIZADO
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config=generation_config)        
        # 4. Monta o prompt (Persona + Tarefa)
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
            # 5. Chama a IA
            response = model.generate_content(full_prompt)
            ai_text = response.text

            # 6. Lógica de Salvamento Inteligente
            # Se o agente for um "Refinador", "Arquiteto" ou "Engenheiro", salvamos o resultado
            nome_agente = agente.nome.lower()
            if "refinador" in nome_agente or "arquiteto" in nome_agente or "engenheiro" in nome_agente:
                card.prompt_refinado = ai_text
                card.save()

            return Response({
                "result": ai_text,
                "agente_usado": agente.nome
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"ERRO GEMINI: {str(e)}") # Log no terminal para ajudar no debug
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