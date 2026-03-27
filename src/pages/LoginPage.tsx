import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, bypassLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/kanban');
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <ShieldCheck size={12} className="text-primary" />
            Acesso Restrito v1.0
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Von Previ</h1>
          <p className="text-white/40 text-sm">Entre com suas credenciais para gerenciar leads</p>
        </div>

        <div className="glass p-8 rounded-[32px] border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@vonprevi.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono ml-4">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-[10px] text-center uppercase tracking-widest font-bold">E-mail ou senha incorretos</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-bold mt-2 disabled:opacity-50"
            >
              {loading ? 'Autenticando...' : 'Acessar Painel'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <button 
              type="button" 
              onClick={() => {
                bypassLogin();
                navigate('/kanban');
              }}
              className="w-full py-4 text-sm font-bold mt-4 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-white/60 flex items-center justify-center gap-2"
            >
              Acessar Painel Teste
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-white/30">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="text-primary hover:underline font-semibold transition-all">
            Criar empresa agora
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
