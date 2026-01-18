from django.db import models

class AgenteIA(models.Model):
    """
    Define uma 'persona' para a IA.
    Ex: 'Engenheiro de Prompt', 'Crítico de Ideias', 'Gerador de Código'.
    """
    nome = models.CharField(max_length=100)
    descricao = models.CharField(max_length=200, help_text="Breve descrição do que ele faz")
    
    # O 'System Prompt' que define a personalidade
    prompt_sistema = models.TextField(help_text="Ex: 'Você é um especialista em React. Critique o código...'")
    
    # Criatividade (0.0 a 1.0)
    temperatura = models.FloatField(default=0.7)
    
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome