import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Bot, BrainCircuit, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService'; // Certifique-se que criou este arquivo
import toast from 'react-hot-toast';

export default function Settings() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    prompt_sistema: '',
    temperatura: 0.7
  });

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setIsLoading(true);
    try {
      const data = await aiService.getAgents();
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        selectAgent(data[0]);
      } else if (data.length === 0) {
        handleNewAgent();
      }
    } catch (error) {
      toast.error("Erro ao carregar agentes.");
    } finally {
      setIsLoading(false);
    }
  }

  function selectAgent(agent) {
    setSelectedAgent(agent);
    setFormData({
      nome: agent.nome,
      descricao: agent.descricao,
      prompt_sistema: agent.prompt_sistema,
      temperatura: agent.temperatura
    });
  }

  function handleNewAgent() {
    setSelectedAgent(null);
    setFormData({
      nome: '',
      descricao: '',
      prompt_sistema: 'Atue como um especialista em...',
      temperatura: 0.7
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (selectedAgent) {
        await aiService.updateAgent(selectedAgent.id, formData);
        toast.success("Agente atualizado!");
      } else {
        await aiService.createAgent(formData);
        toast.success("Agente criado!");
      }
      loadAgents();
    } catch (error) {
      toast.error("Erro ao salvar.");
    }
  }

  async function handleDelete() {
    if (!selectedAgent) return;
    if (!confirm(`Excluir ${selectedAgent.nome}?`)) return;

    try {
      await aiService.deleteAgent(selectedAgent.id);
      toast.success("Removido.");
      setSelectedAgent(null);
      loadAgents();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col max-h-screen">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <BrainCircuit className="text-indigo-600 dark:text-indigo-400" /> Configurações de IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Gerencie seu time de agentes inteligentes.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row overflow-hidden">
        
        {/* LISTA DE AGENTES (Sidebar) */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
          <div className="p-4">
            <button onClick={handleNewAgent} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl transition-all shadow-sm font-medium active:scale-95">
              <Plus size={18} /> Criar Novo Agente
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {isLoading ? (
              <p className="text-center p-4 text-gray-400 text-sm">Carregando time...</p>
            ) : agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent)}
                className={`w-full text-left p-4 rounded-xl transition-all border group relative ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-white dark:bg-gray-700 border-indigo-500 shadow-md ring-1 ring-indigo-500 z-10' 
                    : 'border-transparent hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'
                }`}
              >
                <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${selectedAgent?.id === agent.id ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
                    <Bot size={16} />
                  </div>
                  {agent.nome}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-2 pl-9">
                  {agent.descricao}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FORMULÁRIO (Main) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white dark:bg-gray-800 custom-scrollbar">
          <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {selectedAgent ? 'Editar Persona' : 'Nova Persona'}
              </h3>
              {selectedAgent && (
                <button type="button" onClick={handleDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome do Agente</label>
                <input 
                  type="text" required
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ex: Arquiteto de Software"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Função / Descrição</label>
                <input 
                  type="text" required
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ex: Especialista em estrutura de dados"
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                <span>Prompt do Sistema (System Instruction)</span>
                <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles size={12} /> Use instruções claras
                </span>
              </label>
              <div className="relative">
                <textarea 
                  required rows={8}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed"
                  placeholder="Você é um assistente sênior focado em..."
                  value={formData.prompt_sistema}
                  onChange={e => setFormData({...formData, prompt_sistema: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Criatividade (Temperatura): <span className="text-indigo-600">{formData.temperatura}</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-indigo-600"
                value={formData.temperatura}
                onChange={e => setFormData({...formData, temperatura: parseFloat(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                <span>Rígido (0.0)</span>
                <span>Equilibrado (0.5)</span>
                <span>Criativo (1.0)</span>
              </div>
            </div>

            <div className="pt-6 flex justify-end border-t border-gray-100 dark:border-gray-700">
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95">
                <Save size={20} />
                {selectedAgent ? 'Salvar Alterações' : 'Criar Agente'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}