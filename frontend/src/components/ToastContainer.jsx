import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useAppContext();

  const getIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'info': return <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'error': return 'bg-rose-900/90 text-rose-100 border-rose-700/50';
      case 'warning': return 'bg-amber-900/90 text-amber-100 border-amber-700/50';
      case 'info': return 'bg-blue-900/90 text-blue-100 border-blue-700/50';
      default: return 'bg-slate-900/90 text-slate-100 border-slate-700/50';
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border backdrop-blur-md text-xs font-semibold whitespace-nowrap ${getBg(toast.type)}`}
          >
            {getIcon(toast.type)}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
