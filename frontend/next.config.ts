import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of async operations in server components
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Enable ESLint during development builds
  eslint: {
    // ESLint will run during builds and fail on violations
    ignoreDuringBuilds: false,
  },
  
  // Enable TypeScript checking during development
  typescript: {
    // Fail builds on TypeScript errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
