import os
import sys
import django
from django.core.management import call_command

# Configura o ambiente Django para o script funcionar
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def export_data():
    print("📦 Iniciando exportação BLINDADA (UTF-8)...")
    
    output_file = "backup_dados.json"
    
    # Tabelas para excluir
    excludes = [
        "contenttypes",
        "auth.permission",
        "admin.logentry",
        "sessions.session",
    ]
    
    # Abre o arquivo forçando UTF-8
    with open(output_file, 'w', encoding='utf-8') as f:
        try:
            call_command(
                'dumpdata',
                exclude=excludes,
                natural_foreign=True,
                natural_primary=True,
                indent=2,
                stdout=f  # Joga a saída direto no arquivo
            )
            print(f"✅ Sucesso! '{output_file}' salvo em UTF-8.")
        except Exception as e:
            print(f"❌ Erro: {e}")

if __name__ == "__main__":
    export_data()