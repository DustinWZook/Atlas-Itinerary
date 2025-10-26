'use client';
// Authentication utility functions using Supabase
import { createSupabaseClient } from '@/lib/shared/supabaseClient';
// Initiates Google sign-in flow
export async function signInWithGoogle() {
  const supabase = createSupabaseClient();// create supabase client
  const { error } = await supabase.auth.signInWithOAuth({ // start OAuth sign-in
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` }
  });// redirect to /home after sign-in
  if (error) throw error;// throw any errors
}

// Initiates sign-in flow for supabase
export async function signOut() {
  const supabase = createSupabaseClient();
  await supabase.auth.signOut();
}

// Checks if a user is currently signed in
export async function isSignedIn() {
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();// get current user
  return !!user;// return true if user exists
}