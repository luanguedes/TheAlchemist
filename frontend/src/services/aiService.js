import api from './api';

export const aiService = {
  // Lista todos os agentes
  getAgents: async () => {
    const response = await api.get('ai/agentes/');
    return response.data;
  },

  // Cria um novo
  createAgent: async (agentData) => {
    const response = await api.post('ai/agentes/', agentData);
    return response.data;
  },

  // Atualiza existente
  updateAgent: async (id, agentData) => {
    const response = await api.put(`ai/agentes/${id}/`, agentData);
    return response.data;
  },

  // Remove
  deleteAgent: async (id) => {
    await api.delete(`ai/agentes/${id}/`);
  }
};