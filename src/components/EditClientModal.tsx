import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, FileText, Save, Loader2, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { useApp, Cliente } from '../context/AppContext';
import { formatCPF, formatPhone } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, cliente }) => {
  const { updateCliente } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    endereco: '',
    cidade: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        cpf: cliente.cpf || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        data_nascimento: cliente.data_nascimento || '',
        endereco: cliente.endereco || '',
        cidade: cliente.cidade || ''
      });
    }
  }, [cliente, isOpen]);

  const handleSubmit = async () => {
    if (!cliente || !formData.nome?.trim() || isSaving) return;

    setIsSaving(true);
    const result = await updateCliente(cliente.id, formData);
    setIsSaving(false);

    if (result.success) {
      showToast('Cliente atualizado com sucesso!', 'success');
      onClose();
    } else {
      showToast(`Erro ao atualizar cliente: ${result.error}`, 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cpf') formattedValue = formatCPF(value);
    if (name === 'telefone') formattedValue = formatPhone(value);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 text-white">
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
                <h3 className="text-2xl font-black tracking-tight">Editar Lead</h3>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">Atualizar informações no sistema</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    autoFocus
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CPF */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">CPF (Opcional)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      name="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      name="telefone"
                      type="text"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">E-mail (Opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="empresa@exemplo.com"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              {/* Data Nascimento e Cidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Data de Nascimento</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      name="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={handleChange}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Cidade</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      name="cidade"
                      type="text"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="Ex: São Paulo"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Endereço Completo</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    name="endereco"
                    type="text"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro..."
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
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
                disabled={!formData.nome?.trim() || isSaving}
                className="flex-1 py-4 rounded-2xl bg-primary text-[#0c0c0e] text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} strokeWidth={3} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditClientModal;
