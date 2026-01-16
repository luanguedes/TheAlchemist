import api from './api';

export const projectService = {
  // Listar todos os projetos
  getAll: async () => {
    const response = await api.get('workspaces/');
    return response.data;
  },

  // Criar novo projeto
  create: async (data) => {
    // data deve ser { titulo: "Nome", descricao: "..." }
    // Enviamos o ID do user 1 fixo por enquanto (já que desligamos o auth)
    const payload = { ...data, dono: 1 }; 
    const response = await api.post('workspaces/', payload);
    return response.data;
  },

  // Deletar projeto
  delete: async (id) => {
    await api.delete(`workspaces/${id}/`);
  }
};