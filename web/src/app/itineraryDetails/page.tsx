'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <Link href={'/home'}>Home</Link>
      <h1>Itinerary Details</h1>
      <p>work in progress...</p>
      <button onClick={signOut} style={{ padding: '8px 12px', marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}

/*function itineraryDetailPage(){
}*/

/*function loadItems(tripId:Id){
}*/

/*funtion handleItems(input:AddItemInput){
}*/

/*function handleUpdateItem(itemId:Id, patch:UpdateItemInput){
}*/

/*function handleRemoveItem(itemId:Id){
}*/