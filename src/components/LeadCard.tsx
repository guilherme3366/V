import React, { useState } from 'react';
import { Lead, useApp } from '../context/AppContext';
import { MessageSquare, Paperclip, MoreVertical, Trash2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../utils/cn';
import CustomSelect from './CustomSelect';

interface LeadCardProps {
  lead: Lead;
  isOverlay?: boolean;
}

const LeadCard = ({ lead, isOverlay }: LeadCardProps) => {
  const navigate = useNavigate();
  const { updateLead, deleteLead } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const handleCardClick = (e: React.MouseEvent) => {
    // If we're dragging, don't navigate
    if (isDragging) return;
    navigate(`/negociacao/${lead.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
      className={cn(
        "glass-card p-4 rounded-2xl border border-white/5 transition-all cursor-grab active:cursor-grabbing group relative select-none",
        isDragging && !isOverlay && "opacity-20",
        isOverlay ? "rotate-2 scale-105 border-primary/50 shadow-[0_0_40px_rgba(203,249,102,0.3)] bg-surface z-[1000]" : "hover:border-primary/20"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <CustomSelect
          value={lead.status_negociacao}
          options={[
            { value: 'andamento', label: 'ANDAMENTO' },
            { value: 'vendido', label: 'VENDIDO' },
            { value: 'perdido', label: 'PERDIDO' },
            { value: 'pausado', label: 'PAUSADO' }
          ]}
          onChange={(val) => updateLead(lead.id, { status_negociacao: val as any })}
          buttonClassName={cn(
            "px-2 py-0.5 pr-1 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all border border-transparent hover:border-white/10 pointer-events-auto",
            lead.status_negociacao === 'andamento' && "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
            lead.status_negociacao === 'vendido' && "bg-green-500/10 text-green-400 hover:bg-green-500/20",
            lead.status_negociacao === 'perdido' && "bg-red-500/10 text-red-400 hover:bg-red-500/20",
            lead.status_negociacao === 'pausado' && "bg-white/5 text-white/40 hover:bg-white/10"
          )}
          dropdownClassName="w-32 left-0 bottom-full mb-1 origin-bottom"
        />
        
        <div className="relative">
          <button 
            className="text-white/20 hover:text-white transition-colors pointer-events-auto p-1 z-10 relative" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <MoreVertical size={14} />
          </button>
          
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} 
              />
              <div 
                className="absolute top-full right-0 mt-1 w-40 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    navigate(`/chat-focado/${lead.id}`);
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-white hover:bg-primary/20 hover:text-primary transition-colors flex items-center gap-2 pointer-events-auto"
                >
                  <MessageCircle size={12} />
                  Ir para Chat
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    if (window.confirm('Tem certeza que deseja excluir esta negociação?')) {
                      deleteLead(lead.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 pointer-events-auto"
                >
                  <Trash2 size={12} />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 pointer-events-none">
        <h4 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{lead.cliente?.nome}</h4>
        <p className="text-[10px] text-white/60 font-medium italic mt-0.5">{lead.titulo}</p>
        <p className="text-[10px] text-white/30 truncate mt-1">{lead.cliente?.email}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5 pointer-events-none">
        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-bold border border-white/5">
          {lead.responsavel_id === 'u1' ? 'AV' : 'U'}
        </div>
        
        <div className="flex items-center gap-3 text-white/20">
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            <span className="text-[10px] font-mono">2</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip size={12} />
            <span className="text-[10px] font-mono">1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
