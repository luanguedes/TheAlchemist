import { useState, useEffect } from 'react';
import { X, Bot, Clock, Sparkles, Trash2, Save, Copy, Check } from 'lucide-react'; // <--- Importei Copy e Check
import { projectService } from '../services/projectService';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

export default function CardModal({ isOpen, onClose, cardData, columns, onSave, onDelete }) {
  if (!isOpen) return null;

  // Estados
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo_original: '',
    prazo: '',
    coluna: ''
  });

  const [currentCardId, setCurrentCardId] = useState(null);
  
  // IA States
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // Estado para feedback visual do copiar

  // Carregar dados
  useEffect(() => {
    if (isOpen) {
      loadAgents();
      setCurrentCardId(cardData?.id || null);
      
      setFormData({
        titulo: cardData?.titulo || '',
        conteudo_original: cardData?.conteudo_original || '',
        prazo: cardData?.prazo ? cardData.prazo.slice(0, 16) : '', 
        coluna: cardData?.coluna || cardData?.columnId || columns?.[0]?.id || ''
      });
      
      setAiResult(cardData?.prompt_refinado || '');
      setIsCopied(false);
    }
  }, [isOpen, cardData]);

  async function loadAgents() {
    try {
      const data = await aiService.getAgents();
      setAgents(data);
      if (data.length > 0) setSelectedAgentId(data[0].id);
    } catch (e) { console.error(e); }
  }

  // Função auxiliar de salvar (usada pelo botão e pela IA)
  async function performSave() {
    if (!formData.titulo.trim()) {
        toast.error("O título é obrigatório");
        return null;
    }

    const payload = { ...formData, prazo: formData.prazo || null };

    try {
      let savedCard;
      if (currentCardId) {
        savedCard = await projectService.updateCard(currentCardId, payload);
      } else {
        savedCard = await projectService.createCard(formData.coluna, payload);
        setCurrentCardId(savedCard.id);
      }
      onSave(); // Atualiza o Kanban no fundo
      return savedCard.id; // Retorna o ID para uso
    } catch (error) {
      toast.error("Erro ao salvar.");
      return null;
    }
  }

  // Botão Salvar da UI
  async function handleManualSave() {
    const id = await performSave();
    if (id) toast.success(currentCardId ? "Card atualizado!" : "Card criado!");
  }

  // Botão Gerar IA
  async function handleGenerateAI() {
    // 1. FORÇA O SALVAMENTO ANTES DE GERAR
    // Isso garante que o backend leia a descrição que você acabou de digitar
    const activeId = await performSave(); 
    
    if (!activeId) return; // Se falhou ao salvar, para aqui
    
    setIsGenerating(true);
    try {
      const response = await projectService.refineCard(activeId, selectedAgentId);
      setAiResult(response.result);
      toast.success("Sugestão gerada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro na IA.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Função de Copiar
  function handleCopy() {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setIsCopied(true);
    toast.success("Copiado para área de transferência!");
    setTimeout(() => setIsCopied(false), 2000);
  }

  const currentColumn = columns?.find(c => c.id === parseInt(formData.coluna));
  const headerColor = currentColumn?.cor || '#F1F5F9';
  const isEditing = !!currentCardId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-black/5" style={{ backgroundColor: headerColor }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase opacity-70 text-gray-800">Em:</span>
            <select 
              value={formData.coluna}
              onChange={(e) => setFormData({...formData, coluna: parseInt(e.target.value)})}
              className="bg-white/50 px-3 py-1 rounded-full text-sm font-semibold text-gray-900 border-none outline-none cursor-pointer hover:bg-white/80 transition-colors"
            >
              {columns?.map(col => <option key={col.id} value={col.id}>{col.titulo}</option>)}
            </select>
          </div>
          <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-800">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8 custom-scrollbar">
          
          {/* ESQUERDA (Formulário) */}
          <div className="flex-1 space-y-6">
            <input 
              type="text" 
              placeholder="Título da Tarefa"
              autoFocus={!isEditing}
              className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600 text-gray-800 dark:text-white"
              value={formData.titulo}
              onChange={e => setFormData({...formData, titulo: e.target.value})}
            />

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição Detalhada</label>
              <textarea 
                placeholder="Escreva os detalhes aqui..."
                rows={8}
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-none resize-none text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                value={formData.conteudo_original}
                onChange={e => setFormData({...formData, conteudo_original: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Clock size={14} /> Prazo de Entrega
              </label>
              <input 
                type="datetime-local"
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-none outline-none text-gray-700 dark:text-white w-full md:w-auto"
                value={formData.prazo}
                onChange={e => setFormData({...formData, prazo: e.target.value})}
              />
            </div>
          </div>

          {/* DIREITA (Ações e IA) */}
          <div className="w-full md:w-80 space-y-6 md:pl-8 md:border-l border-gray-100 dark:border-gray-700">
            
            <button 
              onClick={handleManualSave} 
              className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {isEditing ? 'Salvar Alterações' : 'Salvar (Habilita IA)'}
            </button>

            {/* CARD DA IA */}
            <div className={`
                bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/50 transition-opacity duration-300
                ${!isEditing ? 'opacity-50 pointer-events-none' : 'opacity-100'}
            `}>
              <h3 className="text-indigo-900 dark:text-indigo-300 font-bold flex items-center gap-2 mb-4 text-sm">
                <Bot size={18} /> TheAlchemist IA
              </h3>
              
              <div className="space-y-3">
                <div>
                   <label className="text-[10px] font-bold text-indigo-400 uppercase mb-1 block">Agente</label>
                   <select 
                        value={selectedAgentId}
                        onChange={e => setSelectedAgentId(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-white dark:bg-gray-800 border-none text-sm outline-none shadow-sm"
                    >
                        {agents.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                    </select>
                </div>

                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating} // Removido !isEditing pois o save automático resolve
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 dark:shadow-none"
                >
                  {isGenerating ? <Sparkles className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Gerar Sugestão
                </button>
              </div>

              {/* RESULTADO + BOTÃO COPIAR */}
              {aiResult && (
                <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800 animate-in slide-in-from-top-2 relative">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-bold text-indigo-500 uppercase">Resultado</span>
                     
                     {/* BOTÃO COPIAR AQUI */}
                     <button 
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                     >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isCopied ? 'Copiado!' : 'Copiar'}
                     </button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-300 max-h-40 overflow-y-auto border border-indigo-50 dark:border-indigo-900 custom-scrollbar">
                    <pre className="whitespace-pre-wrap font-sans">{aiResult}</pre>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => isEditing && onDelete(currentCardId)} 
              disabled={!isEditing}
              className={`
                w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all
                ${isEditing 
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer' 
                    : 'text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70'}
              `}
            >
              <Trash2 size={18} />
              Excluir Card
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}