import React, { useState } from 'react';
import { Lead, Etapa, useApp } from '../context/AppContext';
import { MoreVertical, User, Phone, Mail, MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LeadListProps {
  leads: Lead[];
  etapas: Etapa[];
}

const LeadList = ({ leads, etapas }: LeadListProps) => {
  const navigate = useNavigate();
  const { deleteLead } = useApp();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getEtapaName = (etapaId: string) => {
    return etapas.find(e => e.id === etapaId)?.nome_etapa || 'Sem etapa';
  };

  return (
    <div className="glass rounded-[32px] overflow-hidden border-white/5 pb-20 sm:pb-0">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">Lead / Cliente</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">Contato</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">Etapa</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-mono text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr 
                key={lead.id} 
                className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group cursor-pointer"
                onClick={() => navigate(`/negociacao/${lead.id}`)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                      {lead.cliente.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{lead.cliente.nome}</p>
                      <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Criado em {new Date(lead.criado_em).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Phone size={12} />
                      {lead.cliente.telefone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Mail size={12} />
                      {lead.cliente.email || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-xs font-medium px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-white/60">
                    {getEtapaName(lead.etapa_id)}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    lead.status_negociacao === 'andamento' 
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10' 
                      : lead.status_negociacao === 'vendido'
                      ? 'bg-green-500/10 text-green-400 border-green-500/10'
                      : 'bg-red-500/10 text-red-500 border-red-500/10'
                  }`}>
                    {lead.status_negociacao}
                  </span>
                </td>
                <td className="px-6 py-5 text-right relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                    }}
                    className="text-white/20 hover:text-white transition-colors p-2 relative z-10"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === lead.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} 
                      />
                      <div 
                        className="absolute right-8 top-12 mt-1 w-40 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
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
                            setOpenMenuId(null);
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadList;
