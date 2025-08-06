'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onDismiss(toast.id);
      }, 300); // 0.3 seconds fade out
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const handleClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 shrink-0" />;
    }
  };

  const getAlertClass = () => {
    switch (toast.type) {
      case 'success':
        return 'alert alert-success';
      case 'error':
        return 'alert alert-error';
      case 'warning':
        return 'alert alert-warning';
      case 'info':
        return 'alert alert-info';
    }
  };

  return (
    <div 
      role="alert" 
      className={`${getAlertClass()} cursor-pointer transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 w-full">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-sm opacity-70 mt-1">
              {toast.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  position?: 'top-center' | 'top-end' | 'top-start' | 'center' | 'end' | 'start' | 'bottom-end';
}

export function ToastContainer({ 
  toasts, 
  onDismiss, 
  position = 'bottom-end' 
}: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-center':
        return 'toast toast-top toast-center';
      case 'top-end':
        return 'toast toast-top toast-end';
      case 'top-start':
        return 'toast toast-top toast-start';
      case 'center':
        return 'toast toast-center toast-middle';
      case 'end':
        return 'toast toast-end toast-middle';
      case 'start':
        return 'toast toast-start toast-middle';
      case 'bottom-end':
        return 'toast toast-bottom toast-end';
      default:
        return 'toast toast-bottom toast-end';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      aria-live="assertive" 
      className={getPositionClasses()}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Custom hook for managing toasts
let toastCounter = 0;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    dismissToast,
    showSuccess: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    showError: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    showWarning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    showInfo: (title: string, message?: string) => addToast({ type: 'info', title, message }),
  };
}