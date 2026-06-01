import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  isDanger = true
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className={`p-4 sm:p-5 flex items-start gap-3 ${isDanger ? 'bg-rose-50/50' : 'bg-slate-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-700'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">{title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                {message}
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-lg transition-colors shadow-sm ${
                isDanger 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
