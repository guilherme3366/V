import React, { useState } from 'react';
import { Etapa, Lead, useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import LeadCard from './LeadCard';
import { Plus, MoreHorizontal, Edit2, Trash2, X, Check } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanColumnProps {
  etapa: Etapa;
  leads: Lead[];
  onDelete?: (etapa: Etapa) => void;
}

const KanbanColumn = ({ etapa, leads, onDelete }: KanbanColumnProps) => {
  const { updateEtapa, deleteEtapa } = useApp();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(etapa.nome_etapa);
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id,
  });

  const handleRename = () => {
    if (editName.trim() && editName !== etapa.nome_etapa) {
      updateEtapa(etapa.id, editName);
      showToast('Etapa renomeada!', 'info');
    }
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(etapa);
    }
    setIsMenuOpen(false);
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-80 h-full rounded-[32px] transition-all duration-300",
        isOver ? "bg-primary/[0.02] ring-1 ring-primary/20 ring-inset" : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
          {isEditing ? (
            <div className="flex items-center gap-1 w-full">
              <input 
                autoFocus
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="bg-white/5 border border-primary/30 rounded-lg px-2 py-0.5 text-sm w-full focus:outline-none"
              />
              <button onClick={handleRename} className="text-primary hover:text-white transition-colors">
                <Check size={14} />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-sm tracking-tight truncate">{etapa.nome_etapa}</h3>
              <span className="bg-white/5 text-white/40 text-[10px] px-2 py-0.5 rounded-full font-mono flex-shrink-0">
                {leads.length}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1 relative">
          <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
            <Plus size={16} />
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "p-1.5 hover:bg-white/5 rounded-lg transition-all",
              isMenuOpen ? "text-primary" : "text-white/20 hover:text-white"
            )}
          >
            <MoreHorizontal size={16} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-40 glass rounded-xl border border-white/10 shadow-2xl z-50 p-1.5"
                >
                  <button 
                    onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-white/40 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Edit2 size={12} />
                    Renomear
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                    Excluir Etapa
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="min-h-[150px] flex flex-col gap-3">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
          
          <button className="w-full py-3 border border-dashed border-white/5 rounded-2xl text-white/20 text-xs hover:border-white/10 hover:text-white/40 transition-all mt-2">
            + Adicionar Negociação
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;
