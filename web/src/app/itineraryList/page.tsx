'use client';

import Link from 'next/link';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';
import { useEffect, useState } from 'react';

import ItineraryCard from '@/components/ItineraryCard';
import ItineraryModal from '@/components/ItineraryModal';
import '@/css/itineraryList.css';

import { getItineraries, removeItinerary } from '@/lib/repos/itineraries';
import { itinerayRow } from '@/lib/shared/types';
import Header from '@/components/Header';

export default function itineraryListPage() {
  const supabase = createSupabaseClient();

  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<itinerayRow | null>(null);

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
      } catch { }
      window.location.assign('/signin?signedout=1');
    }
  };

  async function handleDeleteItinerary(itineraryid: string) {
    setLoading(true);
    try {
      await removeItinerary(itineraryid);

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

  function handleModal(itinerary: itinerayRow) {
    setModalOpen(true);
    setSelectedItinerary(itinerary);
  }

  return (
    <>
      <Header onSignOut={signOut} />
      <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
        <h1>Itinerary List</h1>

        {loading ? <p>Loading Itineraries...</p> : <div className='itineraryGrid'>
          {itineraries.map(itin =>
            <ItineraryCard itinerary={itin} key={itin.itineraryid} clickExpand={handleModal} clickDelete={handleDeleteItinerary} />
          )}
        </div>}

        <ItineraryModal open={modalOpen} itinerary={selectedItinerary} onClose={() => setModalOpen(false)} />
      </main>
    </>
  );
}
