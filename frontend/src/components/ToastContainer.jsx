import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useAppContext();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-premium border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-50/90 border-rose-200 text-rose-800'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
