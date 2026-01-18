import api from './api';

export const projectService = {
  // --- PROJETOS ---
  getAll: async () => {
    const response = await api.get('workspaces/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`workspaces/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('workspaces/', data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`workspaces/${id}/`);
  },

  // --- COLUNAS ---
  createColumn: async (projetoId, titulo) => {
    const response = await api.post('colunas/', { 
      projeto: projetoId, 
      titulo 
    });
    return response.data;
  },

  deleteColumn: async (id) => {
    await api.delete(`colunas/${id}/`);
  },

  // --- CARDS ---
  createCard: async (colunaId, conteudo) => {
    const response = await api.post('cards/', { 
      coluna: colunaId, 
      conteudo_original: conteudo 
    });
    return response.data;
  },

  deleteCard: async (id) => {
    await api.delete(`cards/${id}/`);
  },

  // --- MOVIMENTAÇÃO (Drag & Drop) ---
  moveCard: async (cardId, novaColunaId, novaPosicao) => {
    await api.post(`cards/${cardId}/mover/`, {
      coluna_id: novaColunaId,
      nova_posicao: novaPosicao
    });
  },

  // --- IA (TheAlchemist) ---
  // ADICIONADO AGORA: Essa função chama a rota de IA que criamos no backend
  refineCard: async (cardId) => {
    const response = await api.post(`cards/${cardId}/refinar/`);
    return response.data;
  }
};