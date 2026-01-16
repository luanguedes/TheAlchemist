from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjetoViewSet, ColunaViewSet, CardViewSet

router = DefaultRouter()

# Adicione basename='nome' em todas as rotas para evitar o erro
router.register(r'workspaces', ProjetoViewSet, basename='projeto')
router.register(r'colunas', ColunaViewSet, basename='coluna')
router.register(r'cards', CardViewSet, basename='card')

urlpatterns = [
    path('', include(router.urls)),
]