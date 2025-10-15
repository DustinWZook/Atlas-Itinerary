'use client';

import { createSupabaseClient } from '@/lib/shared/supabaseClient';


export default function HomePage() {
  const supabase = createSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };

  return (
    <main style={{ padding: 16 }}>
      <h1>Hello, world!</h1>
      <button onClick={handleSignOut} style={{ padding: '8px 12px', marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}
