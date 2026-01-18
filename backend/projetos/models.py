from django.db import models
from django.contrib.auth.models import User

class Projeto(models.Model):
    titulo = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    dono = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projetos_dono')
    membros = models.ManyToManyField(User, related_name='projetos_membro', blank=True)
    arquivado = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

class Coluna(models.Model):
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='colunas')
    titulo = models.CharField(max_length=50)
    ordem = models.IntegerField(default=0)
    # NOVA: Cor da coluna (Hexadecimal)
    cor = models.CharField(max_length=7, default='#F1F5F9') # Cinza pastel padrão

    def __str__(self):
        return f"{self.titulo} - {self.projeto.titulo}"

class Card(models.Model):
    coluna = models.ForeignKey(Coluna, on_delete=models.CASCADE, related_name='cards')
    # NOVO: Título curto do card
    titulo = models.CharField(max_length=100, default="Nova Tarefa") 
    # MANTIDO: Descrição detalhada
    conteudo_original = models.TextField() 
    prompt_refinado = models.TextField(blank=True, null=True)
    ordem = models.IntegerField(default=0)
    # NOVO: Prazo de entrega
    prazo = models.DateTimeField(null=True, blank=True)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo