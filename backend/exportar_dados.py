import os
import sys

# Script para exportar dados do SQLite de forma limpa
def export_data():
    print("📦 Iniciando exportação do SQLite...")
    
    # Nome do arquivo de saída
    output_file = "backup_dados.json"
    
    # Tabelas para excluir (evita conflitos de ID e dados inúteis)
    excludes = [
        "contenttypes",
        "auth.permission",
        "admin.logentry",
        "sessions.session",
    ]
    
    exclude_args = " ".join([f"-e {table}" for table in excludes])
    
    # Comando do Django
    # --natural-foreign e --natural-primary ajudam a manter as relações corretas
    # --indent 2 deixa o arquivo legível
    command = f"python manage.py dumpdata --natural-foreign --natural-primary {exclude_args} --indent 2 > {output_file}"
    
    print(f"🔄 Executando: {command}")
    exit_code = os.system(command)
    
    if exit_code == 0:
        print(f"✅ Sucesso! Dados salvos em '{output_file}'")
        print("Agora você pode fazer commit deste arquivo e subir para o Railway.")
    else:
        print("❌ Erro ao exportar dados.")

if __name__ == "__main__":
    export_data()