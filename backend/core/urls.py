from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Painel Administrativo do Django
    path('admin/', admin.site.urls),

    # Rotas do Kanban (Workspaces, Colunas, Cards)
    # Ex: http://localhost:8000/api/workspaces/
    path('api/', include('projetos.urls')),

    # Rotas da Inteligência Artificial (Seus Agentes)
    # Ex: http://localhost:8000/api/ai/run/
    path('api/ai/', include('ai_engine.urls')),

    # Autenticação para a interface navegável do Django Rest Framework
    # (Útil para testar login direto no navegador)
    path('api-auth/', include('rest_framework.urls')),
]