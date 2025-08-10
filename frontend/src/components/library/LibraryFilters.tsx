'use client';

import { useMemo } from 'react';
import { Note } from '@/types';

interface LibraryFiltersProps {
  notes: Note[];
  searchTerm: string;
}

export function useLibraryFilters({ notes, searchTerm }: LibraryFiltersProps) {
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return notes;
    }

    return notes.filter(note => {
      const searchableText = [
        note.content || '',
        note.snippet || '',
        note.noteTitle || '',
        note.pageUrl || ''
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm.toLowerCase());
    });
  }, [notes, searchTerm]);

  return { filteredNotes };
}