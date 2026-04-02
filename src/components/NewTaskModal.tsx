import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, Type, List, Loader2, Plus, Phone, Calendar, Users, Mail, MessageSquare, Coffee } from 'lucide-react';
import { useApp, TipoTarefa } from '../context/AppContext';
import { cn } from '../lib/utils';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  negociacaoId: string;
  onCreated: () => void;
}

const TAREFA_TIPOS: { value: TipoTarefa; label: string; icon: any; color: string }[] = [
  { value: 'tarefa', label: 'Tarefa Geral', icon: List, color: 'text-primary' },
  { value: 'ligação', label: 'Ligação', icon: Phone, color: 'text-blue-400' },
  { value: 'reunião', label: 'Reunião', icon: Users, color: 'text-purple-400' },
  { value: 'visita', label: 'Visita', icon: MapPin, color: 'text-orange-400' },
  { value: 'email', label: 'E-mail', icon: Mail, color: 'text-yellow-400' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400' },
  { value: 'almoço', label: 'Almoço', icon: Coffee, color: 'text-pink-400' },
];

import { MapPin } from 'lucide-react';

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, negociacaoId, onCreated }) => {
  const { addTarefa } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'tarefa' as TipoTarefa,
    data_vencimento: '',
    concluida: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || isCreating) return;

    setIsCreating(true);
    const result = await addTarefa({
      ...formData,
      negociacao_id: negociacaoId,
      data_vencimento: formData.data_vencimento ? new Date(formData.data_vencimento).toISOString() : undefined
    });
    setIsCreating(false);

    if (result.success) {
      onCreated();
      onClose();
      setFormData({
        titulo: '',
        tipo: 'tarefa',
        data_vencimento: '',
        concluida: false
      });
    } else {
      alert(result.error || 'Erro ao criar tarefa');
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
            className="relative w-full max-w-lg bg-[#0c0c0e] p-8 md:p-10 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Glow Background */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] -z-10" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">Nova Tarefa</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">Planejar próxima ação</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">O que deve ser feito?</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    autoFocus
                    required
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Enviar proposta comercial"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10 text-white"
                  />
                </div>
              </div>

              {/* Tipo de Tarefa */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Tipo de Ação</label>
                <div className="grid grid-cols-4 gap-2">
                  {TAREFA_TIPOS.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo: tipo.value })}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                          formData.tipo === tipo.value
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "bg-white/[0.02] border-white/5 text-white/20 hover:border-white/10 hover:text-white/40"
                        )}
                      >
                        <Icon size={18} />
                        <span className="text-[8px] uppercase font-bold tracking-tighter">{tipo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data e Horário */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Data e Horário</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="datetime-local"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all text-white [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Concluído */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 group cursor-pointer" onClick={() => setFormData({ ...formData, concluida: !formData.concluida })}>
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  formData.concluida ? "bg-primary border-primary text-black" : "border-white/10 group-hover:border-primary/40"
                )}>
                  {formData.concluida && <CheckCircle2 size={16} strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white/60">Já foi concluído?</p>
                  <p className="text-[9px] text-white/20 uppercase font-mono">Marcar como finalizado</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-white/[0.03] text-sm font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all border border-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.titulo.trim() || isCreating}
                  className="flex-1 py-4 rounded-2xl bg-primary text-[#0c0c0e] text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={3} />
                      Criar Tarefa
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewTaskModal;
