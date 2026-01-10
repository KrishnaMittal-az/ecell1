import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  // Return cached client if available
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build, return a dummy that will be replaced at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Server-side during build - throw to prevent prerendering
      throw new Error('Supabase environment variables not available');
    }
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}
