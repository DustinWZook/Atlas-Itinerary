'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/shared/supabaseClient'
import { useEffect, useState } from 'react'
import { getItineraries } from '@/lib/repos/itineraries'
import ItineraryCard from '@/components/ItineraryCard'
import '@/css/itineraryList.css'

export default function itineraryListPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItineraries = async () => {
        try {
            const itins = await getItineraries();
            setItineraries(itins);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setLoading(false);
        }
    }

    fetchItineraries();
  }, []);

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
      <h1>View Itineraries</h1>
      <div className='itineraryGrid'>
        {itineraries.map(itin =>
          <ItineraryCard itinerary={itin} key={itin.itineraryid} />
        )}
      </div>
      <button onClick={signOut} style={{ padding: '8px 12px', marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}
