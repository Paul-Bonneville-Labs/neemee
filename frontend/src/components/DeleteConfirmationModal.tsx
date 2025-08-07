'use client';

import { XIcon, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  isLoading = false
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 backdrop-blur-sm bg-base-content/10"
      onClick={!isLoading ? onClose : undefined}
    >
      {/* Modal */}
      <div 
        className="relative bg-base-100 rounded-lg text-left overflow-hidden shadow-2xl transform transition-all max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-base-100 px-4 pt-5 pb-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-error" />
              </div>
              <h3 className="text-lg font-medium text-base-content">
                {title}
              </h3>
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="text-base-content/60 hover:text-base-content transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-base-content/70 mb-4">
              {message}
            </p>
            
            {itemName && (
              <div className="bg-base-200 rounded-md p-3 border-l-4 border-error">
                <p className="text-sm font-medium text-base-content">
                  {itemName}
                </p>
              </div>
            )}
            
            <p className="text-xs text-error mt-4 font-medium">
              This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="btn btn-error disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}