import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
export function createSupabaseClient(): SupabaseClient {
  if (client) return client;
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: 'pkce', autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } }
  );
  return client;
}