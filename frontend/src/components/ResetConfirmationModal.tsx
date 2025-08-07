'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ResetConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}: ResetConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-base-100 rounded-lg border border-base-300 shadow-2xl w-full max-w-md transform transition-all duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          aria-describedby="reset-modal-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h2 id="reset-modal-title" className="text-lg font-semibold text-base-content">
                Reset Bookmarklet Setup
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-base-200 transition-colors duration-200"
              aria-label="Close modal"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-base-content/70" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div role="alert" className="alert alert-warning">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="font-semibold">This will reset your bookmarklet setup</h3>
                  <p className="text-sm">Your current bookmarklet will stop working immediately.</p>
                </div>
              </div>

              <div id="reset-modal-description" className="space-y-3 text-sm text-base-content/80">
                <p className="font-medium">What will happen:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your current API key will be permanently deleted</li>
                  <li>The bookmarklet will no longer work for capturing highlights</li>
                  <li>You&apos;ll need to generate a new API key and update your bookmarklet</li>
                </ul>

                <p className="font-medium text-success">What won&apos;t be affected:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All your saved notes and highlights will remain safe</li>
                  <li>Your account settings and preferences</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-base-300">
            <button
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-error"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Resetting...
                </>
              ) : (
                'Reset Setup'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}