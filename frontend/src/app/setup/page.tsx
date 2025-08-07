'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookmarkletDashboard } from '@/components/BookmarkletDashboard';
import { Sidebar, HamburgerButton } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import appConfig from '../../../config.json';

export default function BookmarkletSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-base-100/50 backdrop-blur-lg border-b border-base-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Hamburger */}
            <div className="flex items-center gap-3">
              <HamburgerButton 
                isOpen={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
              <Link href="/" className="text-2xl font-bold text-base-content hover:text-primary transition-colors">
                {appConfig.app.name}
              </Link>
              <span className="ml-2 text-2xl text-base-content/70">Bookmarklet Setup</span>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Profile Menu */}
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookmarkletDashboard />
      </main>
    </div>
  );
}