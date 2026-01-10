import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  // Return cached client if available
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During SSR/build without env vars, return null - client will be created on browser
  if (!supabaseUrl || !supabaseAnonKey) {
    // Only throw on client-side where env vars should always be available
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }
    // Return a mock client during build that will never be used
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}
