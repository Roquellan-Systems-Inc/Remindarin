import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 bg-foundation z-[101] rounded-t-3xl shadow-2xl max-h-[88vh] flex flex-col"
          >
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <div className="text-xl font-semibold text-text-primary">{title}</div>
              <button onClick={onClose} className="p-3 -mr-3 text-text-secondary hover:text-text-primary transition-colors" aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}