from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RunAIActionView, ActionTemplateViewSet

router = DefaultRouter()
router.register(r'templates', ActionTemplateViewSet) # Cria /api/ai/templates/

urlpatterns = [
    path('run/', RunAIActionView.as_view(), name='run-ai'),
    path('', include(router.urls)), # Inclui as rotas do router
]