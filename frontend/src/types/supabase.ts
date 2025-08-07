import { Database } from '@/lib/database.types';

// Type-safe aliases for database tables, inserts, updates, enums, and composite types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type CompositeTypes<T extends keyof Database['public']['CompositeTypes']> = Database['public']['CompositeTypes'][T];

// Direct database type export
export type { Database };