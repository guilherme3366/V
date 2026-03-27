import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface Option {
  value: string;
  label: string;
  color?: string;
  className?: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  placeholder?: string;
}

const CustomSelect = ({
  value,
  options,
  onChange,
  className,
  buttonClassName,
  dropdownClassName,
  placeholder = "Selecione..."
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full flex items-center justify-between gap-2 transition-all outline-none",
          buttonClassName || "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="opacity-40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className={cn(
              "absolute z-[9999] mt-2 min-w-[160px] overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl backdrop-blur-xl",
              dropdownClassName || "w-full left-0"
            )}
            style={{ 
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div className="p-1.5 space-y-0.5 max-h-[240px] overflow-y-auto no-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all group",
                    value === option.value 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-white/60 hover:text-white hover:bg-white/5",
                    option.className
                  )}
                >
                  <span className={cn(
                    "flex items-center gap-2",
                    option.color && `text-${option.color}`
                  )}>
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check size={14} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
