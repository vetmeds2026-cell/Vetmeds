"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically remove after 2 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-md border 
                ${toast.type === 'error' ? 'bg-red-500 text-white border-red-400/50' : 
                  toast.type === 'warning' ? 'bg-yellow-500 text-white border-yellow-400/50' :
                  'bg-[#1b3a34] text-[#fcf8ef] border-white/10'}
              `}>
                <div className="bg-white/20 p-2 rounded-xl">
                  {toast.type === 'success' && <FaCheckCircle className="text-yellow-400" size={20} />}
                  {toast.type === 'error' && <FaExclamationCircle className="text-white" size={20} />}
                  {toast.type === 'info' && <FaInfoCircle className="text-blue-200" size={20} />}
                </div>
                <div className="flex-grow">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                    {toast.type.toUpperCase()}
                  </p>
                  <p className="text-sm font-bold leading-tight">{toast.message}</p>
                </div>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
