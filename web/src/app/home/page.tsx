'use client';

import { useRouter } from 'next/navigation';
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
      <h1>Hello, world!</h1>
      <button onClick={signOut} style={{ padding: '8px 12px', marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}
