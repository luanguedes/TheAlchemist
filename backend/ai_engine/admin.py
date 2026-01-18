from django.contrib import admin
from .models import AgenteIA  # <--- Nome correto

@admin.register(AgenteIA)
class AgenteIAAdmin(admin.ModelAdmin):
    list_display = ('nome', 'temperatura', 'criado_em')
    search_fields = ('nome', 'descricao')