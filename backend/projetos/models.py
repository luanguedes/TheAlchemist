from django.db import models
from django.contrib.auth.models import User

class Projeto(models.Model):
    """
    Representa uma 'Área de Trabalho'.
    Pode ser arquivado para sair da dashboard principal.
    """
    dono = models.ForeignKey(User, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, verbose_name="Descrição")
    
    # Define se aparece na Dashboard ou no Arquivo
    arquivado = models.BooleanField(default=False)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo

class Coluna(models.Model):
    """
    As colunas do Kanban (Ex: Backlog, Fazendo, Refinado).
    Possui tema de cor para o frontend estilizar.
    """
    # Opções de cores que o Frontend vai interpretar (Tailwind)
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
    ordem = models.PositiveIntegerField(default=0) # Para ordenar: 1, 2, 3...
    
    # Aqui salvamos apenas a "chave" da cor. O React decide o tom exato.
    cor = models.CharField(max_length=20, choices=OPCOES_CORES, default='gray')

    class Meta:
        ordering = ['ordem'] # Garante que venha na ordem certa do banco

    def __str__(self):
        return f"{self.titulo} - {self.projeto.titulo}"

class Card(models.Model):
    """
    A ideia ou tarefa. Contém o texto original e o refinado pela IA.
    """
    coluna = models.ForeignKey(Coluna, related_name='cards', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    
    # Onde você escreve rápido
    conteudo_original = models.TextField(verbose_name="Anotação Rápida")
    
    # Onde a IA salva o resultado (Opcional, pois começa vazio)
    prompt_refinado = models.TextField(blank=True, null=True, verbose_name="Prompt Otimizado")
    
    ordem = models.PositiveIntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordem']

    def __str__(self):
        return self.titulo