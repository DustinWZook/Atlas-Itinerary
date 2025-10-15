'use client';

import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export async function signInWithGoogle() {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` }
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createSupabaseClient();
  await supabase.auth.signOut();
}

export async function isSignedIn() {
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}