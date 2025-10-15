'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const supabase = createSupabaseClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const next = params.get('next') ?? '/home';
      if (code) {
        try { await supabase.auth.exchangeCodeForSession(code); } catch {}
      }
      router.replace(next);
    };
    run();
  }, [router]);

  return (
    <main style={{ padding: 16 }}>
      <p>Signing you in...</p>
    </main>
  );
}
