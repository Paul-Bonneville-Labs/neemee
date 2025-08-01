# Highlight Management Components

This directory contains the transformed highlight management components adapted from the original file management system.

## Components Overview

### HighlightList.tsx
The main component for displaying and managing captured highlights. Features:
- Search across highlight text, page titles, and URLs
- Filter by date range (today, this week, this month)
- Sort by recency, age, or alphabetically
- Group highlights by domain with favicons
- Visual indicators for recent highlights
- Inline delete and view actions
- Responsive design with dark mode support

### HighlightManager.tsx
A higher-level component that combines `HighlightList` with data fetching and modal management:
- Integrates with the `useHighlights` hook
- Handles bookmarklet modal display
- Manages error states and loading
- Provides a complete highlight management interface

### BookmarkletModal.tsx
Modal component for displaying bookmarklet setup instructions:
- Fetches bookmarklet code from the API
- Provides copy-to-clipboard functionality
- Shows step-by-step setup instructions
- Responsive design with proper accessibility

## Hooks

### useHighlights.ts
Custom hook for managing highlight data:
- Fetches highlights from `/api/highlights/list`
- Handles pagination and error states
- Provides delete functionality
- Supports auto-refresh for real-time updates
- Manages loading states and error handling

## Usage Example

```tsx
import { HighlightManager } from '@/components/HighlightManager';

export default function MyPage() {
  const userInfo = { name: 'John Doe', role: 'contributor' };

  const handleHighlightSelect = (highlightId: string) => {
    // Handle highlight selection
    console.log('Selected:', highlightId);
  };

  return (
    <div className="h-screen flex">
      <div className="w-80">
        <HighlightManager
          sidebarWidth={320}
          userInfo={userInfo}
          onHighlightSelect={handleHighlightSelect}
        />
      </div>
      {/* Main content area */}
    </div>
  );
}
```

## API Integration

The components expect these API endpoints:
- `GET /api/highlights/list` - List highlights with pagination
- `DELETE /api/highlights/:id` - Delete a specific highlight
- `GET /api/bookmarklet` - Get bookmarklet code and instructions

## TypeScript Interfaces

Key interfaces used:
- `Highlight` - Individual highlight data
- `HighlightListProps` - Props for HighlightList component
- `HighlightListResponse` - API response format
- `BookmarkletResponse` - Bookmarklet API response

## Features

- **Smart Grouping**: Highlights are grouped by domain with visual indicators
- **Advanced Search**: Search across content, titles, and URLs
- **Date Filtering**: Filter by time periods with intuitive options
- **Visual Feedback**: Recent highlights, loading states, hover effects
- **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support
- **Responsive Design**: Works on mobile and desktop with proper touch targets
- **Dark Mode**: Full dark mode support with proper contrast ratios
- **Error Handling**: Graceful error states with retry options

## Performance Considerations

- Debounced search input to reduce API calls
- Efficient re-rendering with proper React patterns
- Lazy loading of domain favicons
- Virtual scrolling support (can be added for large lists)
- Optimistic updates for delete operations

## Accessibility Features

- Proper semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly content
- High contrast colors in dark mode
- Focus management for modals