'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

export default function SigninPage() {
  const supabase = createSupabaseClient();

  return (
    <main className="signin-main">
        <div className="signin-card">
            <h1 className="signin-title">Sign in</h1>
            <Auth
            supabaseClient={supabase}
            providers={['google']}
            onlyThirdPartyProviders
            appearance={{ theme: ThemeSupa }}
            redirectTo={`${window.location.origin}/auth/callback?next=/home`}
            />
      </div>
    </main>
  );
}
