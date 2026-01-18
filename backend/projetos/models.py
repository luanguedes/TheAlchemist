from django.db import models
from django.contrib.auth.models import User

class Projeto(models.Model):
    """
    Representa uma 'Área de Trabalho'.
    """
    dono = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projetos_donos')
    membros = models.ManyToManyField(User, related_name='projetos_participados', blank=True)
    
    titulo = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, verbose_name="Descrição")
    
    arquivado = models.BooleanField(default=False)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo

class Coluna(models.Model):
    """
    As colunas do Kanban (Ex: Backlog, Fazendo, Refinado).
    """
    OPCOES_CORES = [
        ('gray', 'Cinza (Padrão)'),
        ('blue', 'Azul Soft'),
        ('green', 'Verde Soft'),
        ('purple', 'Roxo Soft'),
        ('rose', 'Rosa Soft'),
        ('amber', 'Laranja Soft'),
    ]

    projeto = models.ForeignKey(Projeto, related_name='colunas', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=50)
    
    # Default 0 é importante para criar sem erro
    ordem = models.IntegerField(default=0) 
    
    cor = models.CharField(max_length=20, choices=OPCOES_CORES, default='gray')

    class Meta:
        ordering = ['ordem']

    def __str__(self):
        return f"{self.titulo} - {self.projeto.titulo}"

class Card(models.Model):
    """
    A ideia ou tarefa.
    """
    coluna = models.ForeignKey(Coluna, related_name='cards', on_delete=models.CASCADE)
    
    # Tornamos o título opcional para a criação rápida funcionar
    titulo = models.CharField(max_length=200, blank=True, null=True)
    
    # O conteúdo principal
    conteudo_original = models.TextField(verbose_name="Anotação Rápida")
    
    # Onde a IA salva o resultado
    prompt_refinado = models.TextField(blank=True, null=True, verbose_name="Prompt Otimizado")
    
    # Ordem visual
    ordem = models.IntegerField(default=0)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordem']

    def __str__(self):
        # Se tiver título usa ele, se não usa o começo do conteúdo
        return self.titulo if self.titulo else self.conteudo_original[:50]