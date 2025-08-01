# Neemee Supabase Configuration Guide

## Overview

This guide provides comprehensive instructions for configuring your Supabase project for the Neemee personal knowledge management system. The configuration includes multiple authentication providers, database schema with RLS policies, API key management, and entity extraction pipeline integration.

## Project Details

- **Project URL**: https://vmgpoyloolwtixsffijn.supabase.co
- **Anonymous Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ3BveWxvb2x3dGl4c2ZmaWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MDc5MTQsImV4cCI6MjA2MzM4MzkxNH0.czcM-j7DqtxsdftrNR4Zv_nayL5lt0uKWnPu_hUiLZQ`

## Database Schema

### Core Tables

#### 1. Highlights (`highlights`)
Main table for storing user highlights from websites.

**Key Features:**
- Full-text search with `tsvector` support
- AI entity extraction integration
- Markdown-first content storage
- Automatic reading time calculation
- Comprehensive metadata storage

#### 2. Entities (`entities`)
Knowledge graph entities extracted from highlights.

**Supported Entity Types:**
- Person: Individual people mentioned or referenced
- Organization: Companies, institutions, government bodies
- Topic: Subjects, themes, concepts, technologies
- URL: Website domains and specific pages
- Event: Meetings, conferences, product launches, news events
- Product: Software, hardware, services, offerings

#### 3. Entity Relationships (`entity_relationships`)
Connections between entities with contextual information.

#### 4. User Profiles (`user_profiles`)
Extended user information and preferences.

#### 5. API Keys (`user_api_keys`)
Secure API key management for bookmarklet functionality.

### Row Level Security (RLS)

All tables have comprehensive RLS policies implemented:

- **User Isolation**: Users can only access their own data
- **API Key Access**: Bookmarklet functionality via secure API keys
- **Granular Permissions**: Separate policies for SELECT, INSERT, UPDATE, DELETE operations

## Authentication Configuration

### Current Providers
To set up multiple authentication providers, you need to configure them in your Supabase dashboard:

### 1. Email/Password Authentication
Already enabled by default.

### 2. Magic Link Authentication
Already enabled by default.

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Application Type**: Web application
   - **Authorized redirect URIs**: `https://vmgpoyloolwtixsffijn.supabase.co/auth/v1/callback`
5. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Add your **Client ID** and **Client Secret**
   - Configure scopes: `email`, `profile`

### 4. GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App:
   - **Application name**: Neemee
   - **Homepage URL**: Your domain (e.g., https://neemee.com)
   - **Authorization callback URL**: `https://vmgpoyloolwtixsffijn.supabase.co/auth/v1/callback`
3. In Supabase Dashboard → Authentication → Providers → GitHub:
   - Enable GitHub provider
   - Add your **Client ID** and **Client Secret**

### 5. Anonymous Authentication
Enable anonymous authentication for temporary users who want to try the system:

1. In Supabase Dashboard → Authentication → Providers → Anonymous
2. Enable anonymous sign-ins
3. Set appropriate rate limits

## API Functions

### Highlight Management

#### `capture_highlight()`
Captures a highlight from the bookmarklet with automatic processing.

```sql
SELECT * FROM capture_highlight(
    'Article Title',
    'https://example.com/article',
    'Selected text to highlight',
    'Full article content (optional)',
    'Context before selection (optional)',
    'Context after selection (optional)',
    '{"user_agent": "Chrome/123", "viewport": "1920x1080"}'::jsonb
);
```

#### `get_user_highlights()`
Retrieves user highlights with filtering and pagination.

```sql
SELECT * FROM get_user_highlights(20, 0, 'active', 'example.com', 'search term');
```

#### `search_highlights()`
Full-text search across user highlights.

```sql
SELECT * FROM search_highlights('AI artificial intelligence', 10, 0);
```

### API Key Management

#### `create_user_api_key()`
Generates a new API key for bookmarklet access.

```sql
SELECT * FROM create_user_api_key(
    'Bookmarklet Key',
    '["highlights:read", "highlights:write"]'::jsonb
);
```

#### `revoke_api_key()`
Revokes an existing API key.

```sql
SELECT revoke_api_key('api-key-id-here');
```

### Entity Processing

#### `upsert_entities()`
Processes AI-extracted entities and creates/updates entity records.

```sql
SELECT * FROM upsert_entities(
    'highlight-id-here',
    '[
        {"name": "OpenAI", "type": "Organization", "confidence": 0.95},
        {"name": "ChatGPT", "type": "Product", "confidence": 0.90}
    ]'::jsonb
);
```

#### `mark_highlight_processed()`
Marks a highlight as processed after AI entity extraction.

```sql
SELECT mark_highlight_processed(
    'highlight-id-here',
    '{"entities": [...]}',
    '{"relationships": [...]}'
);
```

### User Management

#### `get_user_stats()`
Returns comprehensive user statistics.

```sql
SELECT * FROM get_user_stats();
```

#### `update_user_preferences()`
Updates user preferences and settings.

```sql
SELECT update_user_preferences('{"theme": "dark", "auto_extract_entities": true}');
```

## Frontend Integration

### Environment Variables

Create a `.env.local` file in your frontend directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vmgpoyloolwtixsffijn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ3BveWxvb2x3dGl4c2ZmaWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MDc5MTQsImV4cCI6MjA2MzM4MzkxNH0.czcM-j7DqtxsdftrNR4Zv_nayL5lt0uKWnPu_hUiLZQ
```

### TypeScript Integration

The TypeScript types have been generated and saved to `/types/supabase.ts`. Import and use them:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database, Highlight, Entity, UserProfile } from '../types/supabase'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type-safe operations
const { data: highlights } = await supabase
  .from('highlights')
  .select('*')
  .returns<Highlight[]>()
```

## Backend Integration

### FastAPI Integration

For the backend API integration, use the service role key (keep this secret):

```python
import os
from supabase import create_client, Client

# Use service role key for backend operations
SUPABASE_URL = "https://vmgpoyloolwtixsffijn.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Get from dashboard

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# API key validation
async def validate_api_key(api_key: str):
    result = await supabase.rpc('get_user_by_api_key', {'p_api_key': api_key}).execute()
    if result.data:
        return result.data[0]
    return None
```

## Bookmarklet Configuration

### Bookmarklet JavaScript

```javascript
javascript:(function(){
    const API_ENDPOINT = 'https://your-backend-api.com/capture';
    const API_KEY = 'your-user-api-key';
    
    const selection = window.getSelection().toString();
    if (!selection) {
        alert('Please select some text first!');
        return;
    }
    
    const data = {
        title: document.title,
        url: window.location.href,
        highlighted_text: selection,
        content: document.body.innerText,
        metadata: {
            user_agent: navigator.userAgent,
            viewport: window.innerWidth + 'x' + window.innerHeight
        }
    };
    
    fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.ok) {
            alert('Highlight captured successfully!');
        } else {
            alert('Failed to capture highlight');
        }
    });
})();
```

## Security Considerations

### API Keys
- API keys are prefixed with `nee_` for easy identification
- Keys are securely hashed before storage
- Scope-based permissions control access levels
- Keys can be revoked instantly

### Row Level Security
- All user data is isolated using RLS policies
- API key validation ensures secure access
- No cross-user data leakage possible

### Authentication
- Multiple providers reduce single points of failure
- Anonymous access is rate-limited
- OAuth providers use secure callback URLs

## Performance Optimizations

### Database Indexes
- Full-text search indexes on highlights
- User-specific indexes for fast queries
- Entity relationship indexes for graph queries
- Composite indexes for common query patterns

### Caching Strategy
- User profiles cached on login
- Entity data cached for repeated queries
- Search results can be cached client-side

## Monitoring and Maintenance

### Regular Tasks
1. Monitor API key usage and revoke unused keys
2. Review entity extraction accuracy and retrain if needed
3. Analyze search query patterns for optimization
4. Monitor database performance and optimize queries

### Analytics
- Track highlight capture rates
- Monitor entity extraction quality
- Analyze user engagement patterns
- Performance metrics for search functionality

## Next Steps

1. **Configure OAuth Providers**: Set up Google and GitHub OAuth as described above
2. **Deploy Backend**: Integrate the FastAPI backend with entity extraction pipeline
3. **Test Bookmarklet**: Create and test the bookmarklet functionality
4. **Monitor Usage**: Set up logging and analytics for system monitoring

## Support

For issues or questions about this configuration:
1. Check Supabase logs in the dashboard
2. Review RLS policies if access issues occur
3. Validate API key permissions for bookmarklet problems
4. Monitor entity extraction pipeline for processing issues