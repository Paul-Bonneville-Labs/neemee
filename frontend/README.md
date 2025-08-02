# Frontend Application

**Technology Stack**: Next.js 15 + React 19 + TypeScript  
**Purpose**: Web application for highlight management and user dashboard  
**Deployment**: Google Cloud Run

## Setup Instructions

This directory contains the complete arrgh-collect frontend application adapted for Neemee.

### Planned Components
- Complete MDX Editor with toolbar and Front Matter support
- File management UI (adapted to highlight management)
- User authentication via Supabase Auth
- Responsive dashboard for viewing and organizing highlights
- Bookmarklet installation and management interface

### Integration Notes
- Replace NextAuth with Supabase Auth
- Replace GitHub API calls with Supabase client calls
- Adapt FileList.tsx to HighlightList.tsx
- Update terminology from "files" to "highlights"

### Development Commands

**Quick Setup:**
```bash
npm install
cp .env.example .env.local  # Configure with your keys
npm run dev                 # Start with Turbopack
```

**Development Scripts:**
```bash
# Development Servers
npm run dev              # Development server with Turbopack
npm run dev:lint         # Dev server + real-time linting (recommended)

# Code Quality & Linting
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run lint:watch       # Watch mode for linting
npm run type-check       # TypeScript type checking
npm run type-check:watch # Watch mode for TypeScript
npm run check            # Run both TypeScript + ESLint

# Production
npm run build            # Production build
npm run start            # Production server
```

**Recommended Development Workflow:**
```bash
# Start development with live linting
npm run dev:lint

# Or run in separate terminals:
npm run dev              # Terminal 1: Dev server  
npm run lint:watch       # Terminal 2: Live linting

# Before committing
npm run check            # Verify no errors
npm run lint:fix         # Auto-fix issues
```

### Tech Stack
- **Next.js 15** with App Router and TypeScript
- **MDXEditor 3.39.1** for rich text editing with Front Matter
- **Tailwind CSS v4** with dark mode support
- **Node.js 20.x** runtime
- **Supabase Auth** (replacing NextAuth from arrgh-collect)

### Project Structure
```
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   ├── dashboard/   # Main interface (adapt to highlights)
│   └── layout.tsx
├── components/       # React components
│   ├── FileList.tsx # → HighlightList.tsx
│   ├── MarkdownEditor.tsx
│   └── ...
└── lib/
    ├── auth.ts      # → Supabase Auth
    └── github.ts    # → Supabase client
```

---
*This frontend provides the user interface foundation for Neemee's highlight management system.*