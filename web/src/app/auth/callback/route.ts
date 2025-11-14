import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/home';
  if (!next.startsWith('/')) {
    next = '/home';
  }

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to signin page with error flag
  return NextResponse.redirect(`${origin}/signin?error=1`);
}

/* Older callback Page code, changed to route and handled on server
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const next = params.get('next') ?? '/home';
      if (code) { try { await supabase.auth.exchangeCodeForSession(code); } catch {} }
      router.replace(next);
    })();
  }, [router]);
  return <main style={{ padding:16 }}>Signing you in...</main>;
}
*/