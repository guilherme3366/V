import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Plus, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import NewClientModal from './NewClientModal';

interface ClientSelectProps {
  value: string; // Nome do cliente para exibição
  onChange: (nome: string, id: string) => void;
}

const ClientSelect: React.FC<ClientSelectProps> = ({ value, onChange }) => {
  const { clientes } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar clientes com base na busca
  const filteredClients = clientes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cpf && c.cpf.includes(searchTerm))
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-white/30 font-mono ml-4">Selecionar Cliente</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary/60 transition-colors" size={18} />
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm cursor-pointer transition-all flex items-center justify-between",
              isOpen ? "ring-1 ring-primary/40 border-primary/20 bg-white/[0.05]" : "hover:bg-white/[0.05]"
            )}
          >
            <span className={value ? "text-white font-medium" : "text-white/20"}>
              {value || "Selecione ou busque um cliente..."}
            </span>
            <ChevronDown className={cn("text-white/20 transition-transform duration-300", isOpen && "rotate-180")} size={18} />
          </div>

          {/* Botão de Adicionar Rápido */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-[#0c0c0e] hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[150] w-full mt-2 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-white/5 bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input
                autoFocus
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    onChange(client.nome, client.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{client.nome}</span>
                    <span className="text-[10px] text-white/30">{client.email || 'Sem e-mail'}</span>
                  </div>
                  {value === client.nome && <Check size={16} className="text-primary" />}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-white/20">
                <User size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">Nenhum cliente encontrado</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-primary text-[10px] font-bold uppercase tracking-wider hover:underline"
                >
                   + Cadastrar "{searchTerm}"
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP DE CADASTRO */}
      <NewClientModal 
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

export default ClientSelect;
