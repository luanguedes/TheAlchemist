from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets # <--- O viewsets foi adicionado aqui
from django.shortcuts import get_object_or_404
from django.conf import settings
import google.generativeai as genai

# Importar modelos
from projetos.models import Card
from .models import ActionTemplate
from .serializers import ActionTemplateSerializer

# Configurar Gemini (Pegando do settings)
# Se der erro aqui, certifique-se que GEMINI_API_KEY está no .env e no settings.py
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class RunAIActionView(APIView):
    """
    Recebe: { "card_id": 1, "template_slug": "bug-hunter" }
    Retorna: { "result": "Texto gerado pela IA..." }
    """
    
    def post(self, request):
        card_id = request.data.get('card_id')
        template_slug = request.data.get('template_slug')

        # 1. Busca os dados no banco
        card = get_object_or_404(Card, id=card_id)
        template = get_object_or_404(ActionTemplate, slug=template_slug)

        # 2. Prepara o prompt
        model = genai.GenerativeModel('gemini-pro')
        
        full_prompt = (
            f"CONTEXTO DO SISTEMA: {template.system_instruction}\n\n"
            f"DADO DO USUÁRIO (CARD): {card.conteudo_original}\n\n"
            f"RESPOSTA:"
        )

        try:
            # 3. Chama a IA
            response = model.generate_content(full_prompt)
            ai_text = response.text

            # 4. (Opcional) Salva no card se for refinamento
            if template_slug == 'refinador-tecnico':
                card.prompt_refinado = ai_text
                card.save()

            return Response({"result": ai_text}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Esta classe deve ficar FORA da anterior (sem indentação na esquerda)
class ActionTemplateViewSet(viewsets.ModelViewSet):
    """
    Permite listar, criar e editar os 'Agentes' (Prompts) pelo Frontend.
    """
    queryset = ActionTemplate.objects.all()
    serializer_class = ActionTemplateSerializer