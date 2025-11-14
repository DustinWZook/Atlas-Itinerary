'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
export const dynamic = 'force-dynamic';

export default function SigninPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const signedOutFlag = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('signedout') === '1';

  const errorFlag = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('error');
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !signedOutFlag) router.replace('/home');
    })();
  }, [router, supabase, signedOutFlag]);

  useEffect(() => {
    if (errorFlag)
      setDisplayError(true);
  }, [errorFlag])

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : undefined;

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 384, padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '.75rem' }}>Sign in</h1>
        
        {displayError && <p style={{textAlign: 'center', color: 'darkred', fontWeight: 'bold'}}>Error signing in! Please try again.</p>}
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
