import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User, Phone, FileText, ArrowRight, ChevronLeft, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { formatCNPJ, formatCEP } from '../lib/utils';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    nome_admin: '',
    email_admin: '',
    senha: '',
    confirmar_senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="w-full max-w-[480px]">
        <div className="mb-10">
          <button 
            onClick={() => step === 1 ? navigate('/login') : prevStep()}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {step === 1 ? 'Voltar para login' : 'Etapa anterior'}
          </button>
          
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Configure sua Empresa</h1>
          <p className="text-white/40 text-sm">Estamos a poucos passos de organizar seu escritório</p>
        </div>

        <div className="glass p-8 rounded-[32px] border-white/10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Nome Fantasia</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="Ex: Von Previ Advogados"
                        value={formData.nome_empresa}
                        onChange={(e) => setFormData({...formData, nome_empresa: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">CNPJ</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={(e) => setFormData({...formData, cnpj: formatCNPJ(e.target.value)})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <button onClick={nextStep} className="btn-primary w-full py-4 text-sm font-bold">
                  Próxima Etapa
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : step === 2 ? (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">CEP</label>
                      <input 
                        type="text" 
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={(e) => setFormData({...formData, cep: formatCEP(e.target.value)})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Número</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        value={formData.numero}
                        onChange={(e) => setFormData({...formData, numero: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Logradouro</label>
                    <input 
                      type="text" 
                      placeholder="Rua, Avenida, etc"
                      value={formData.logradouro}
                      onChange={(e) => setFormData({...formData, logradouro: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Bairro</label>
                      <input 
                        type="text" 
                        placeholder="Bairro"
                        value={formData.bairro}
                        onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Cidade</label>
                      <input 
                        type="text" 
                        placeholder="Cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">UF</label>
                      <input 
                        type="text" 
                        placeholder="UF"
                        maxLength={2}
                        value={formData.uf}
                        onChange={(e) => setFormData({...formData, uf: e.target.value.toUpperCase()})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <button onClick={nextStep} className="btn-primary w-full py-4 text-sm font-bold">
                  Próxima Etapa
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
                <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Seu Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="Como deseja ser chamado?"
                        value={formData.nome_admin}
                        onChange={(e) => setFormData({...formData, nome_admin: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">E-mail Administrativo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="email" 
                        placeholder="admin@suaempresa.com"
                        value={formData.email_admin}
                        onChange={(e) => setFormData({...formData, email_admin: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={formData.senha}
                          onChange={(e) => setFormData({...formData, senha: e.target.value})}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Confirmar</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={formData.confirmar_senha}
                          onChange={(e) => setFormData({...formData, confirmar_senha: e.target.value})}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    const result = await register(formData);
                    if (result.success) {
                      if (result.confirmationRequired) {
                        setError('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
                        setLoading(false);
                      } else {
                        navigate('/kanban');
                      }
                    } else {
                      setError(result.error || 'Erro ao criar conta');
                      setLoading(false);
                    }
                  }} 
                  className="btn-primary w-full py-4 text-sm font-bold disabled:opacity-50"
                >
                  {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                  <ArrowRight size={18} />
                </button>
                {error && (
                  <p className="text-red-400 text-[10px] text-center uppercase tracking-widest font-bold mt-2">{error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
