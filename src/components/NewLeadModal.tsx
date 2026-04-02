import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Filter, Layout, DollarSign, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ServiceSelect from './ServiceSelect';
import ClientSelect from './ClientSelect';

const NewLeadModal: React.FC = () => {
  const { 
    isNewLeadModalOpen, 
    setIsNewLeadModalOpen, 
    preSelectedClientId,
    setPreSelectedClientId,
    funis, 
    etapas, 
    addLead,
    clientes
  } = useApp();

  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nome: '',
    funil_id: funis[0]?.id || '',
    etapa_id: etapas.find(e => e.funil_id === funis[0]?.id)?.id || '',
    titulo: '',
    servico_id: '',
    valor_estimado: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_id) {
       alert("Por favor, selecione ou cadastre um cliente.");
       return;
    }

    addLead({
      ...formData,
      titulo: formData.titulo || `Negociação - ${formData.cliente_nome}`,
      valor_estimado: formData.valor_estimado ? Number(formData.valor_estimado) : undefined
    });

    setFormData({
      cliente_id: '',
      cliente_nome: '',
      funil_id: funis[0]?.id || '',
      etapa_id: etapas.find(e => e.funil_id === funis[0]?.id)?.id || '',
      titulo: '',
      servico_id: '',
      valor_estimado: '',
      observacoes: ''
    });
    setPreSelectedClientId(null);
    setIsNewLeadModalOpen(false);
  };

  // Pre-fill if a client is selected
  React.useEffect(() => {
    if (isNewLeadModalOpen && preSelectedClientId) {
       const cliente = clientes.find(c => c.id === preSelectedClientId);
       if (cliente) {
         setFormData(prev => ({ 
           ...prev, 
           cliente_id: cliente.id, 
           cliente_nome: cliente.nome 
         }));
       }
    } else if (!isNewLeadModalOpen) {
       // Reset when closed
       setFormData({
         cliente_id: '',
         cliente_nome: '',
         funil_id: funis[0]?.id || '',
         etapa_id: etapas.find(e => e.funil_id === funis[0]?.id)?.id || '',
         titulo: '',
         servico_id: '',
         valor_estimado: '',
         observacoes: ''
       });
    }
  }, [isNewLeadModalOpen, preSelectedClientId, clientes, funis, etapas]);

  const currentEtapas = etapas.filter(e => e.funil_id === formData.funil_id);

  return (
    <AnimatePresence>
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNewLeadModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0c0c0e]/95 p-10 rounded-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-2xl"
          >
            {/* Glow Background */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Nova Negociação</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">Capture uma nova oportunidade</p>
              </div>
              <button 
                onClick={() => {
                  setPreSelectedClientId(null);
                  setIsNewLeadModalOpen(false);
                }}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selecionar Cliente */}
              <ClientSelect 
                value={formData.cliente_nome}
                onChange={(nome, id) => setFormData({ ...formData, cliente_nome: nome, cliente_id: id })}
              />

              {/* Servico / Titulo */}
              <ServiceSelect 
                value={formData.titulo}
                onChange={(nome, id) => setFormData({ ...formData, titulo: nome, servico_id: id || '' })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Funil */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Funil</label>
                  <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                    <select
                      value={formData.funil_id}
                      onChange={(e) => {
                        const newFunilId = e.target.value;
                        const firstEtapa = etapas.find(etapa => etapa.funil_id === newFunilId);
                        setFormData({ ...formData, funil_id: newFunilId, etapa_id: firstEtapa?.id || '' });
                      }}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none text-white cursor-pointer"
                    >
                      {funis.map(f => (
                        <option key={f.id} value={f.id} className="bg-[#0c0c0e]">{f.nome_funil}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Etapa */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Etapa Inicial</label>
                  <div className="relative group">
                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                    <select
                      value={formData.etapa_id}
                      onChange={(e) => setFormData({ ...formData, etapa_id: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none text-white cursor-pointer"
                    >
                      {currentEtapas.map(e => (
                        <option key={e.id} value={e.id} className="bg-[#0c0c0e]">{e.nome_etapa}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              {/* Valor Estimado */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Valor Estimado</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="number"
                    value={formData.valor_estimado}
                    onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
                    placeholder="0,00"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setPreSelectedClientId(null);
                    setIsNewLeadModalOpen(false);
                  }}
                  className="flex-1 py-4 rounded-2xl bg-white/[0.03] text-sm font-bold text-white/40 hover:bg-white/5 hover:text-white transition-all border border-white/5"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-primary text-[#0c0c0e] text-sm font-black uppercase tracking-[0.1em] hover:opacity-90 transition-all shadow-[0_10px_40px_-10px_rgba(203,249,102,0.4)]"
                >
                  Criar Negociação
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
