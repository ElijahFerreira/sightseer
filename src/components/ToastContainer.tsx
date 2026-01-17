'use client';

import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-20 left-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
    
    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor = {
    error: 'bg-red-500/90',
    success: 'bg-emerald-500/90',
    info: 'bg-blue-500/90',
  }[toast.type];

  const icon = {
    error: '⚠️',
    success: '✓',
    info: 'ℹ️',
  }[toast.type];

  return (
    <div
      className={`
        ${bgColor} backdrop-blur-sm rounded-xl px-4 py-3 
        flex items-center gap-3 shadow-lg
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      onClick={() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      }}
    >
      <span>{icon}</span>
      <p className="text-sm text-white flex-1">{toast.message}</p>
      <button className="text-white/70 hover:text-white text-lg">&times;</button>
    </div>
  );
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismissToast };
}
