import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Servico } from '../context/AppContext';
import NewServiceModal from './NewServiceModal';

interface ServiceSelectProps {
  value: string; // nome do serviço
  onChange: (nome: string, id?: string) => void;
  placeholder?: string;
}

const ServiceSelect = ({
  value,
  onChange,
  placeholder = "Ex: Aposentadoria Rural, Revisão..."
}: ServiceSelectProps) => {
  const { servicos } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar serviços baseados na busca
  const filteredServices = servicos.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (s: Servico) => {
    onChange(s.nome, s.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text" 
          value={isOpen ? searchTerm : value}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder={placeholder} 
          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10 text-white"
        />
        
        {/* BOTÃO DE ADICIONAR - ABRE O POPUP */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-1 group/btn"
          title="Clique aqui para criar novo serviço"
        >
          <Plus size={16} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase hidden group-hover/btn:block pr-1">Criar</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[110] mt-2 w-full bg-[#0c0c0e]/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-2 max-h-72 overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                <div className="px-3 py-1 opacity-20 text-[10px] uppercase font-mono tracking-widest my-1">
                  Catálogo de Serviços
                </div>
                
                {filteredServices.length > 0 ? (
                  filteredServices.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelect(s)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                          <Briefcase size={14} />
                        </div>
                        <span className="text-sm text-white/80 group-hover:text-white">{s.nome}</span>
                      </div>
                      {value === s.nome && <Check size={16} className="text-primary" />}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-white/20 text-xs italic">
                    Nenhum serviço encontrado. Clique no botão "+" para cadastrar!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP DE CRIAÇÃO */}
      <NewServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(nome, id) => {
          onChange(nome, id);
          setIsModalOpen(false);
          setSearchTerm('');
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export default ServiceSelect;
