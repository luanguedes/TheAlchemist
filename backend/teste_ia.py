import google.generativeai as genai
import os
from dotenv import load_dotenv

# Carrega as variáveis do .env
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"Testando API Key: {api_key[:5]}...")

if not api_key:
    print("ERRO: API Key não encontrada!")
else:
    genai.configure(api_key=api_key)
    
    print("\n--- MODELOS DISPONÍVEIS ---")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Erro ao listar: {e}")