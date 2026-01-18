from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RunAIActionView, AgenteIAViewSet # <--- Agora usando o nome correto

router = DefaultRouter()
# Rota para gerenciar os agentes (CRUD)
router.register(r'agentes', AgenteIAViewSet, basename='agente')

urlpatterns = [
    # Inclui as rotas do router (ex: /api/ai/agentes/)
    path('', include(router.urls)),
    
    # Rota para executar a IA (ex: /api/ai/run/)
    path('run/', RunAIActionView.as_view(), name='run-ai'),
]