'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

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
      } catch {}
      window.location.assign('/signin?signedout=1');
    }
  };

  return (
    <main style={{ padding: 16 }}>
      <Link href={'/itineraryList'}>Itinerary List</Link>
      <h1>Home</h1>
      <p>Hello World!</p>
      <button onClick={signOut} style={{ padding: '8px 12px', marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}
