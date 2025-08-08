import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // During build time or when environment variables are missing/invalid,
  // return a mock client to prevent build failures
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'dummy' || supabaseAnonKey === 'dummy' ||
      typeof window === 'undefined') {
    // Return a mock client that won't cause build errors
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}