'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Home, Bookmark } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
                   border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50
                   transform transition-transform duration-300 ease-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   focus:outline-none`}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        tabIndex={-1}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                     transition-colors duration-200 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-6">
          <ul className="space-y-2">
            <li>
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Library</span>
              </a>
            </li>
            <li>
              <a
                href="/setup"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <Bookmark className="w-5 h-5" />
                <span className="font-medium">Bookmarklet Setup</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium">Neemee</p>
            <p>Personal Knowledge Management</p>
          </div>
        </div>
      </aside>
    </>
  );
}

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
               transition-colors duration-200 focus:outline-none focus:ring-2 
               focus:ring-blue-500 focus:ring-offset-2 mr-3"
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-300 ease-out ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-300 ease-out my-1 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-300 ease-out ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        />
      </div>
    </button>
  );
}