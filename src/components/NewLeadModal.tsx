import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Phone, Mail, Briefcase, ChevronRight, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPhone } from '../lib/utils';

const NewLeadModal = () => {
  const { 
    isNewLeadModalOpen, 
    setIsNewLeadModalOpen, 
    funis, 
    etapas, 
    addLead 
  } = useApp();

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    titulo: '',
    valor_estimado: '',
    funil_id: funis[0]?.id || '',
    etapa_id: etapas.find(e => e.funil_id === funis[0]?.id)?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      ...formData,
      titulo: formData.titulo || 'Novo Serviço',
      valor_estimado: formData.valor_estimado ? Number(formData.valor_estimado) : undefined
    });
    setIsNewLeadModalOpen(false);
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      titulo: '',
      valor_estimado: '',
      funil_id: funis[0]?.id || '',
      etapa_id: etapas.find(e => e.funil_id === funis[0]?.id)?.id || '',
    });
  };

  return (
    <AnimatePresence>
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNewLeadModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass p-8 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -z-10" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Novo Lead</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono mt-1">Capture uma nova oportunidade</p>
              </div>
              <button 
                onClick={() => setIsNewLeadModalOpen(false)}
                className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Nome do Cliente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    autoFocus
                    required
                    type="text" 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Nome completo do cliente" 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Serviço / Titular da Negociação</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Ex: Aposentadoria Rural, Revisão..." 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: formatPhone(e.target.value)})}
                      placeholder="(00) 00000-0000" 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="exemplo@email.com" 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Funil</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <select 
                      value={formData.funil_id}
                      onChange={(e) => {
                        const fid = e.target.value;
                        const firstEtapa = etapas.find(et => et.funil_id === fid);
                        setFormData({...formData, funil_id: fid, etapa_id: firstEtapa?.id || ''});
                      }}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                    >
                      {funis.map(f => (
                        <option key={f.id} value={f.id} className="bg-surface text-white">{f.nome_funil}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Etapa Inicial</label>
                  <div className="relative">
                    <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <select 
                      value={formData.etapa_id}
                      onChange={(e) => setFormData({...formData, etapa_id: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                    >
                      {etapas.filter(e => e.funil_id === formData.funil_id).map(et => (
                        <option key={et.id} value={et.id} className="bg-surface text-white">{et.nome_etapa}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Valor Estimado</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="number" 
                    value={formData.valor_estimado}
                    onChange={(e) => setFormData({...formData, valor_estimado: e.target.value})}
                    placeholder="0,00" 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-primary text-black text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                >
                  Criar Lead
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewLeadModal;
