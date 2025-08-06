# Theme Toggle Implementation Guide

This document describes the complete implementation of a three-state theme toggle system for Next.js with DaisyUI and Tailwind CSS v4.

## Overview

The theme system provides:
- **Light Mode**: Explicit light theme
- **Dark Mode**: Explicit dark theme  
- **System Mode**: Automatically follows `prefers-color-scheme`
- **Persistence**: User preference stored in localStorage
- **SSR Compatible**: Prevents FOUC (Flash of Unstyled Content)
- **DaisyUI Integration**: Uses `data-theme` attribute for theme switching

## Key Components

### 1. ThemeProvider (`/src/components/ThemeProvider.tsx`)

**Purpose**: React Context provider that manages theme state and applies themes.

**Key Features**:
- Manages three-state theme selection (light/dark/system)
- Detects system preference using `window.matchMedia`
- Applies theme via `data-theme` attribute on `document.documentElement`
- Persists user choice in localStorage
- Listens for system preference changes
- Prevents hydration mismatches

**API**:
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const { theme, setTheme, resolvedTheme } = useTheme();
```

### 2. ThemeToggle Components (`/src/components/ThemeToggle.tsx`)

**Multiple UI Variants**:

- **`ThemeToggle`**: Full-featured dropdown with icons and labels
- **`ThemeToggleCompact`**: Compact button that cycles through themes
- **`ThemeSwitch`**: DaisyUI toggle switch (Light/Dark only)
- **`ThemeRadioGroup`**: Radio buttons with fieldset

### 3. ThemeScript (`/src/components/ThemeScript.tsx`)

**Purpose**: Prevents FOUC by setting theme before React hydration.

**How it works**:
- Runs immediately when HTML loads (before React)
- Reads localStorage for user preference
- Detects system preference if no user preference
- Sets `data-theme` attribute on document root
- Handles errors gracefully with light theme fallback

### 4. CSS Configuration (`/src/app/globals.css`)

**DaisyUI Setup**:
```css
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
  base: true;
  styled: true;
  utils: true;
  logs: false;
}

/* Enable Tailwind dark mode to work with DaisyUI themes */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

**Key Changes**:
- Removed `nord` theme, using `light` as default
- Added custom dark variant to integrate Tailwind's `dark:` utilities with DaisyUI
- Disabled logs for cleaner console

## Implementation Steps

### Step 1: Install Dependencies

Ensure you have the required icons:
```bash
npm install lucide-react
```

### Step 2: Update CSS Configuration

Update `src/app/globals.css` to use the new theme configuration shown above.

### Step 3: Add Theme Components

Copy the provided theme components to your project:
- `ThemeProvider.tsx`
- `ThemeToggle.tsx` 
- `ThemeScript.tsx`

### Step 4: Update Layout

Modify `src/app/layout.tsx`:

```tsx
import { ThemeScript } from "@/components/ThemeScript";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 5: Update Providers

Modify `src/components/Providers.tsx`:

```tsx
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Step 6: Add Theme Toggle to Navigation

Add the theme toggle to your navigation components:

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

// In your header/navigation component
<ThemeToggle />
```

## Usage Examples

### Basic Theme Toggle
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

### Using Theme Context
```tsx
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

### Custom Theme Toggle
```tsx
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

function CustomToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="btn-group">
      <button 
        className={`btn ${theme === 'light' ? 'btn-active' : ''}`}
        onClick={() => setTheme('light')}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button 
        className={`btn ${theme === 'dark' ? 'btn-active' : ''}`}
        onClick={() => setTheme('dark')}
      >
        <Moon className="w-4 h-4" />
      </button>
      <button 
        className={`btn ${theme === 'system' ? 'btn-active' : ''}`}
        onClick={() => setTheme('system')}
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
```

## How It Works

### Theme Detection Flow

1. **Page Load**: `ThemeScript` runs immediately
   - Checks localStorage for stored preference
   - Falls back to system preference if no stored value
   - Sets `data-theme` attribute on HTML element

2. **React Hydration**: `ThemeProvider` initializes
   - Reads current theme from DOM
   - Sets up media query listeners for system changes
   - Provides theme state to React components

3. **User Interaction**: Theme toggle components
   - Update theme state via `setTheme`
   - Apply new theme to DOM
   - Persist preference in localStorage

### Storage Strategy

- **Light/Dark**: Stored in localStorage as `"light"` or `"dark"`
- **System**: No localStorage entry (removed if exists)
- **Fallback**: Light theme if localStorage access fails

### SSR Compatibility

- `suppressHydrationWarning` on HTML element prevents hydration warnings
- Theme script runs before React, ensuring consistent theme on first render
- Provider returns children immediately on first render to prevent mismatches

## Testing

Visit `/theme-demo` to test all theme functionality:

1. **Light Mode Test**: Select "Light" - should show light theme colors
2. **Dark Mode Test**: Select "Dark" - should show dark theme colors  
3. **System Mode Test**: Select "System" - should follow OS preference
4. **System Change Test**: Change OS theme setting - should auto-update
5. **Persistence Test**: Refresh page - should remember selection
6. **Component Test**: All DaisyUI components should render correctly in each theme

## Troubleshooting

### FOUC (Flash of Unstyled Content)
- Ensure `ThemeScript` is in `<head>`
- Verify `suppressHydrationWarning` is on `<html>`
- Check that localStorage access is wrapped in try-catch

### Theme Not Applying
- Verify `data-theme` attribute is set on document root
- Check DaisyUI theme names match configuration
- Ensure CSS configuration includes custom dark variant

### Hydration Mismatches
- Confirm theme provider returns children immediately on first render
- Verify theme script sets initial theme before React hydration
- Check that client and server render the same initial state

### System Theme Detection
- Verify `window.matchMedia` is available (client-side only)
- Check media query listener is properly attached/detached
- Ensure system preference detection handles edge cases

## Browser Support

- **Modern Browsers**: Full support with `prefers-color-scheme` detection
- **Older Browsers**: Graceful fallback to light theme
- **SSR/Node**: Safe handling with proper client-side checks

## Performance Considerations

- Theme script is minimal and runs once on page load
- Media query listeners are properly cleaned up
- Theme state changes are batched and efficient
- No unnecessary re-renders during theme switches

This implementation provides a robust, accessible, and performant theme system that integrates seamlessly with DaisyUI and Next.js.