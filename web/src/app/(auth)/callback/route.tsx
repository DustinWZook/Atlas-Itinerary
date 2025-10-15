'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export default function AuthCallbackPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const code = params.get('code');
      const next = params.get('next') ?? '/home';
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
      }
      router.replace(next);
    };
    run();
    
  }, []);

  return <main style={{ padding: 16 }}>Signing you in…</main>;
}