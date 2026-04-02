import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Plus, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (nome: string, id: string) => void;
}

const NewServiceModal: React.FC<NewServiceModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { addServico } = useApp();
  const [nome, setNome] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim() || isCreating) return;

    setIsCreating(true);
    const result = await addServico(nome.trim());
    setIsCreating(false);

    if (result.success && result.data) {
      onCreated(result.data.nome, result.data.id);
      setNome('');
      onClose();
    } else {
      alert(`Erro ao criar serviço: ${result.error || 'Erro desconhecido'}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0c0c0e] p-10 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Glow Background */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] -z-10" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">Novo Serviço</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">Cadastrar no catálogo</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Nome do Serviço</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    autoFocus
                    required
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Ex: Aposentadoria Rural, Revisão..."
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-white/[0.03] text-sm font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all border border-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!nome.trim() || isCreating}
                  className="flex-1 py-4 rounded-2xl bg-primary text-[#0c0c0e] text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={3} />
                      Criar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewServiceModal;
