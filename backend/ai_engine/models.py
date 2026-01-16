from django.db import models

class ActionTemplate(models.Model):
    name = models.CharField(max_length=50, verbose_name="Nome do Modo")
    slug = models.SlugField(unique=True, help_text="Identificador unico (ex: bug-hunter)")
    description = models.CharField(max_length=200, verbose_name="Descrição Curta")
    
    # O segredo está aqui: Você edita como a IA deve se comportar
    system_instruction = models.TextField(verbose_name="Prompt do Sistema (Instrução)")
    
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name