import { createSupabaseServerClient } from '@/lib/shared/supabaseClient';

export async function signInWithGoogle() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
}

export async function isSignedIn() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}