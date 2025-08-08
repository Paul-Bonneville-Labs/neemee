import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Only return mock client during build time or when environment variables are missing/invalid
  // Don't check for window object as it prevents SSR from working properly
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'dummy' || supabaseAnonKey === 'dummy') {
    // Return a mock client that won't cause build errors
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}