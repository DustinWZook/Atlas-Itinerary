'use client';

import Link from 'next/link';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';
import { useEffect, useState } from 'react';

import ItineraryCard from '@/components/ItineraryCard';
import ItineraryModal from '@/components/ItineraryModal';
import '@/css/itineraryList.css';

import { createItinerary, getItineraries, removeItinerary } from '@/lib/repos/itineraries';
import { itinerayRow } from '@/lib/shared/types';

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

  const handleCreateItinerary = async () => {
    setLoading(true);
    try {
      await createItinerary({ name: 'Test Name', traveldestination: 'Test Destination', startdate: '1/1/2026', enddate: '1/15/2026' });

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
      <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
        <Link href={'/home'}>Home</Link>
        <h1>Itinerary List</h1>
        <br />
        <div>
          <button onClick={() => handleCreateItinerary()} style={{ padding: '8px 12px' }}>Test Create Itinerary</button>
        </div>
        {loading ? <p>Loading Itineraries...</p> : <div className='itineraryGrid'>
          {itineraries.map(itin =>
            <ItineraryCard itinerary={itin} key={itin.itineraryid} clickExpand={handleModal} clickDelete={handleDeleteItinerary} />
          )}
        </div>}

        <div>
          <button onClick={signOut} style={{ padding: '8px 12px', marginTop: 12 }}>
            Sign out
          </button>
        </div>

        <ItineraryModal open={modalOpen} itinerary={selectedItinerary} onClose={() => setModalOpen(false)} />
      </main>
    </>
  );
}
