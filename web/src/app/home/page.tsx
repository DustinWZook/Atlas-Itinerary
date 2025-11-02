'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';
import Header from '@/components/Header';

export default function HomePage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } finally {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith('sb-')) localStorage.removeItem(k);
        }
      } catch { }
      window.location.assign('/signin?signedout=1');
    }
  };

  return (
    <>
      <Header onSignOut={signOut} />
      <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
        <h1>Home</h1>
        <p>Welcome to Atlas Itinerary!</p>
      </main>
    </>
  );
}
