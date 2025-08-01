'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Auth, type AuthTab } from '../Auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
  title?: string;
  subtitle?: string;
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  defaultTab = 'anonymous',
  title,
  subtitle 
}: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-md transform transition-all duration-300 scale-100 opacity-100"
        >
          {/* Close Button (Outside modal) */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 
                     rounded-full hover:bg-white/10 transition-colors duration-200 z-10"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Auth Component */}
          <Auth 
            onClose={onClose}
            defaultTab={defaultTab}
            showClose={false} // We handle close externally
            title={title}
            subtitle={subtitle}
          />
        </div>
      </div>
    </div>
  );
}