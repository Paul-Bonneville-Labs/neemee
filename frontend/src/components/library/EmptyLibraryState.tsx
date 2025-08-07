'use client';

import { Plus } from 'lucide-react';
import { UserApiKey } from '@/types';

interface EmptyLibraryStateProps {
  searchTerm: string;
  apiKey: UserApiKey | null;
  onSetupClick: () => void;
}

export function EmptyLibraryState({ searchTerm, apiKey, onSetupClick }: EmptyLibraryStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-base-content/50" />
      </div>
      <h2 className="text-xl font-semibold text-base-content mb-2">
        {searchTerm ? 'No notes found' : 'Your library is empty'}
      </h2>
      <p className="text-base-content/70 mb-4 text-center max-w-md">
        {searchTerm 
          ? `No notes match "${searchTerm}". Try a different search term.`
          : apiKey 
            ? 'Start capturing highlights from any website using your bookmarklet.'
            : 'Start building your knowledge base by capturing your first note.'
        }
      </p>
      {!apiKey && (
        <button 
          onClick={onSetupClick}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Setup Bookmarklet
        </button>
      )}
    </div>
  );
}