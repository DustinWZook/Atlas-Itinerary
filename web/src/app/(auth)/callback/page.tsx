import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export const dynamic = 'force-dynamic';

export default function SigninPage() {
  const supabase = createSupabaseClient();


  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback?next=/home`
      : undefined;

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 384, padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', marginBottom: '.75rem' }}>Sign in</h1>
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