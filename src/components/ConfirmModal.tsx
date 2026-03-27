import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass p-10 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] -z-10 opacity-20 ${
              variant === 'danger' ? 'bg-red-500' : 'bg-primary'
            }`} />

            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-3xl ${
                variant === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'
              }`}>
                <AlertTriangle size={32} />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-10">
              <h3 className="text-2xl font-black tracking-tighter">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{message}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-4 rounded-2xl text-sm font-black uppercase transition-all shadow-xl active:scale-95 ${
                  variant === 'danger' 
                    ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                    : 'bg-primary text-black shadow-primary/20 hover:opacity-90'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
