'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

function CallbackInner() {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      const code = params.get('code');
      const next = params.get('next') ?? '/home';
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      }
      router.replace(next);
    })();
  }, [params, router, supabase]);

  return (
    <main style={{ padding: 16 }}>
      <p>Signing you in...</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main style={{ padding: 16 }}><p>Loading...</p></main>}>
      <CallbackInner />
    </Suspense>
  );
}
