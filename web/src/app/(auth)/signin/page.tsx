'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  
  const signedOutFlag = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('signedout') === '1';
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !signedOutFlag) router.replace('/home');
    })();
  }, [router, supabase, signedOutFlag]);

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=/home`
      : undefined;

  return (
    <main style={{ minHeight:'60vh', display:'grid', placeItems:'center', padding:'1.5rem' }}>
      <div style={{ width:'100%', maxWidth:384, padding:'1.5rem', border:'1px solid #e5e7eb', borderRadius:'1rem' }}>
        <h1 style={{ textAlign:'center', marginBottom:'.75rem' }}>Sign in</h1>
        <Auth
          supabaseClient={supabase}
          providers={['google']}
          onlyThirdPartyProviders
          appearance={{ theme: ThemeSupa }}
          redirectTo={redirectTo}
        />
      </div>
    </main>
  );
}
