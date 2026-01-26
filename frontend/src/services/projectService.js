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
  createColumn: async (projetoId, titulo, ordem = null) => {
    const payload = { 
      projeto: projetoId, 
      titulo 
    };
    if (ordem !== null && ordem !== undefined) {
      payload.ordem = ordem;
    }
    const response = await api.post('colunas/', payload);
    return response.data;
  },

  deleteColumn: async (id) => {
    await api.delete(`colunas/${id}/`);
  },

  // --- CARDS ---
  createCard: async (colunaId, dataOrContent) => {
    // Se for string (antigo), converte. Se for objeto (novo), usa direto.
    let payload = {};
    if (typeof dataOrContent === 'string') {
        payload = { coluna: colunaId, conteudo_original: dataOrContent, titulo: dataOrContent };
    } else {
        payload = { ...dataOrContent, coluna: colunaId };
    }
    
    const response = await api.post('cards/', payload);
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
  updateCard: async (id, data) => {
    const response = await api.patch(`cards/${id}/`, data); // <--- MUDOU DE .put PARA .patch
    return response.data;
  },

  updateColumn: async (id, data) => {
    const response = await api.patch(`colunas/${id}/`, data); // <--- MUDOU DE .put PARA .patch
    return response.data;
  },
  
  // Atualize o refine para aceitar agente
  refineCard: async (cardId, agenteId) => {
    // Agora chamamos /ai/run/ enviando o ID do card e do agente
    const response = await api.post('ai/run/', { 
      card_id: cardId, 
      agente_id: agenteId 
    });
    return response.data;
  },
};
