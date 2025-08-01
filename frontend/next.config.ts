import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of async operations in server components
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
