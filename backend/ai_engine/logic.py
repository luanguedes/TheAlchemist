import google.generativeai as genai
import os
from dotenv import load_dotenv
from .models import AgenteIA

# Carrega a chave única do sistema
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

def transmutar_ideia(conteudo_original, agente_id=None):
    """
    Recebe o texto e o ID do agente que vai trabalhar nele.
    """
    if not API_KEY:
        return "Erro: Chave de API não configurada no .env"

    try:
        # 1. Busca o Agente no banco
        if agente_id:
            agente = AgenteIA.objects.get(id=agente_id)
            system_instruction = agente.prompt_sistema
            temp = agente.temperatura
        else:
            # Fallback se nenhum agente for selecionado (Padrão)
            system_instruction = "Você é um assistente útil de gerenciamento de projetos."
            temp = 0.7

        # 2. Configura o modelo com a 'personalidade' do agente
        model = genai.GenerativeModel(
            'gemini-pro',
            generation_config=genai.types.GenerationConfig(temperature=temp)
        )
        
        # 3. Monta o prompt combinando a Persona + Tarefa
        prompt_final = f"""
        {system_instruction}
        
        --- TAREFA ---
        Analise e processe o seguinte card do Kanban:
        "{conteudo_original}"
        
        Responda em Markdown.
        """
        
        response = model.generate_content(prompt_final)
        return response.text

    except AgenteIA.DoesNotExist:
        return "Erro: O agente selecionado não existe."
    except Exception as e:
        return f"Falha na transmutação: {str(e)}"