'use client';

import { Search, Grid, List, Plus } from 'lucide-react';
import Link from 'next/link';
import { HamburgerButton } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileMenu } from '@/components/auth/ProfileMenu';
import { UserApiKey } from '@/types';
import appConfig from '../../../config.json';

interface LibraryHeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  apiKey: UserApiKey | null;
  onSetupClick: () => void;
}

export function LibraryHeader({
  sidebarOpen,
  onSidebarToggle,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  apiKey,
  onSetupClick
}: LibraryHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-base-100/50 backdrop-blur-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Hamburger */}
          <div className="flex items-center gap-3">
            <HamburgerButton 
              isOpen={sidebarOpen}
              onClick={onSidebarToggle}
            />
            <Link href="/" className="text-2xl font-bold text-base-content hover:text-primary transition-colors">
              {appConfig.app.name}
            </Link>
            <span className="ml-2 text-2xl text-base-content/70">Library</span>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="form-control relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 text-base-content/50" />
              <input
                type="text"
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="input input-bordered w-64 pl-10 bg-base-200 text-base-content placeholder:text-base-content/50 focus:bg-base-300 border-base-300 focus:border-primary"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="join">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`join-item btn btn-sm ${viewMode === 'list' ? 'btn-primary' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Setup Bookmarklet Button - Only show if no API key */}
            {!apiKey && (
              <button 
                onClick={onSetupClick}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Setup Bookmarklet
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Menu */}
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}