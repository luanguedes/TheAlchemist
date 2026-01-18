import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Excluir", cancelText = "Cancelar", isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-800 dark:text-white font-bold">
            {isDanger && <AlertTriangle className="text-red-500" size={20} />}
            {title}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Rodapé (Botões) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
          >
            {cancelText}
          </button>
          
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition-all transform active:scale-95
              ${isDanger 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}
            `}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}