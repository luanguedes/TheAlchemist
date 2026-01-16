from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjetoViewSet, ColunaViewSet, CardViewSet

router = DefaultRouter()
router.register(r'workspaces', ProjetoViewSet, basename='projeto')
router.register(r'colunas', ColunaViewSet)
router.register(r'cards', CardViewSet)

urlpatterns = [
    path('', include(router.urls)),
]