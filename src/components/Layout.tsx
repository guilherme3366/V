import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import NewLeadModal from './NewLeadModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label, collapsed }: { to: string, icon: any, label: string, collapsed: boolean }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
      isActive 
        ? "bg-primary text-black font-semibold shadow-[0_0_20px_rgba(203,249,102,0.2)]" 
        : "text-white/60 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110 flex-shrink-0")} />
    {!collapsed && (
      <motion.span 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-sm tracking-tight whitespace-nowrap"
      >
        {label}
      </motion.span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-4 px-2 py-1 bg-primary text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] uppercase tracking-wider">
        {label}
      </div>
    )}
  </NavLink>
);

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, setIsNewLeadModalOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Back-overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "h-screen fixed left-0 top-0 border-r border-white/5 flex flex-col p-4 glass backdrop-blur-2xl z-[70] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        collapsed ? "w-20" : "w-64",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className={cn("mb-10 flex items-center gap-3 px-2 h-10", collapsed && "justify-center")}>
          <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-black font-black text-xl italic">V</span>
          </div>
          {!collapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tighter"
            >
              Von Previ
            </motion.h1>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {!collapsed && (
            <div className="text-[10px] uppercase tracking-widest text-white/20 font-mono mb-2 px-4">Menu</div>
          )}
          <SidebarItem to="/kanban" icon={LayoutDashboard} label="CRM Kanban" collapsed={collapsed} />
          <SidebarItem to="/leads" icon={Users} label="Gerenciar Leads" collapsed={collapsed} />
          <SidebarItem to="/chat" icon={MessageSquare} label="Mensagens" collapsed={collapsed} />
          <SidebarItem to="/usuarios" icon={Users} label="Equipe" collapsed={collapsed} />
          <SidebarItem to="/configuracoes" icon={Settings} label="Configurações" collapsed={collapsed} />
        </nav>

        {/* Toggle Button for Desktop */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-surface border border-white/10 rounded-full items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 transition-all z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 w-full group",
              collapsed && "justify-center"
            )}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "min-h-screen transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        collapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Topbar */}
        <header className="h-16 sticky top-0 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 glass backdrop-blur-xl z-40">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-white/5 rounded-xl lg:hidden text-white/60"
            >
              <Menu size={20} />
            </button>
            {location.pathname === '/kanban' && (
              <div className="relative max-w-sm w-full hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full bg-white/[0.03] border border-white/5 rounded-full py-2 pl-11 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-white/10"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {location.pathname === '/kanban' && (
              <button 
                onClick={() => setIsNewLeadModalOpen(true)}
                className="btn-primary py-1.5 px-4 text-xs h-9"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Nova Negociação</span>
              </button>
            )}
            
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-green-400 p-[1px]">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-[10px] text-primary">
                  AV
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
      <NewLeadModal />
    </div>
  );
};

export default Layout;
