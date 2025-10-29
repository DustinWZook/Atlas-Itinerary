'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import CitySearch from '@/components/CitySearch';
import CategorySidebar from '@/components/CategorySidebar';
import PlaceCard from '@/components/PlaceCard';
import PlaceModal from '@/components/PlaceModal';
import Pagination from '@/components/Pagination';

import type { Category, CityPick, PlaceDetails, PlaceRow } from '@/lib/shared/types';
import { addItineraryLocation } from '@/lib/repos/locations';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';


// Main Itinerary Details Page
export default function ItineraryDetailsPage() {
  const supabase = createSupabaseClient();

  // Itinerary ID from query string
  // used when adding a place to an
  // itinerary to add places to
  const [itineraryId, setItineraryId] = useState(''); // holds ?itineraryid=... from the URL
  useEffect(() => {
    // Read the query string once on mount; avoids Suspense requirement for useSearchParams
    const qs = new URLSearchParams(window.location.search);
    setItineraryId(qs.get('itineraryid') ?? '');
  }, []);

  // State
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);// map center
  const [city, setCity] = useState('Near you');// city name
  const [selected, setSelected] = useState<Category>('lodging');// selected category
  const [loading, setLoading] = useState(false);// loading state
  const [page, setPage] = useState(1);// pagination page

  const [modalOpen, setModalOpen] = useState(false);// modal open state
  const [active, setActive] = useState<PlaceRow | null>(null);// active place in modal

  // Data state
  type CatState = { rows: PlaceRow[]; nextPageToken: string | null; loaded: boolean };
  // per-category state
  // initialized empty
  // loaded indicates if first fetch has completed
  // stored in an object by category
  const [state, setState] = useState<Record<Category, CatState>>({ // initial empty state
    lodging: { rows: [], nextPageToken: null, loaded: false },
    dining: { rows: [], nextPageToken: null, loaded: false },
    attractions: { rows: [], nextPageToken: null, loaded: false },
  });

  // API helpers
  // fetch first page of results for a category
  async function fetchFirst(cat: Category, lat: number, lng: number) {
    setLoading(true);// set loading state true
    try {// try block for fetch
      const res = await fetch('/api/places', {// fetch call to /api/places
        method: 'POST',// POST method
        headers: { 'Content-Type': 'application/json' },// json header
        body: JSON.stringify({ lat, lng, category: cat, pageSize: 20 }), // request body
      });

      // handle non-ok response
      if (!res.ok) {
        console.error('API /api/places failed', res.status, await res.text());// log error
        return; 
      }

      // parse response JSON and update state
      const { rows, nextPageToken } = await res.json();// parse json response
      setState((s) => ({ ...s, [cat]: { rows, nextPageToken, loaded: true } }));// update state with results
    } finally {// finally block to reset loading state
      setLoading(false);// reset loading state false
    }
  }

  // fetch more results for a category (pagination)
  async function fetchMore(cat: Category) {// fetch more results for category
    const st = state[cat];// get current state for category
    if (!center || !st.nextPageToken) return;// require center and nextPageToken
    setLoading(true);// set loading state true
    try {// try block for fetch
      const res = await fetch('/api/places', {// fetch call to /api/places
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: center.lat, // use current center
          lng: center.lng, // use current center
          category: cat, // category
          pageToken: st.nextPageToken, // pagination token
          pageSize: 20, // page size
        }),
      });

      // handle non-ok response
      if (!res.ok) {
        console.error('API /api/places failed', res.status, await res.text());
        return;
      }

      // parse response JSON and append to state
      const { rows, nextPageToken } = await res.json();
      setState((s) => ({ // update state with appended result
        ...s,// spread existing state
        [cat]: { rows: [...s[cat].rows, ...rows], nextPageToken, loaded: true },// append new rows
      }));
    } finally {
      setLoading(false);// reset loading state false
    }
  }

  // geolocation default on first load
  const didInit = useRef(false); // ref to prevent StrictMode double run helps with keeping API calls minimal

  // on mount, get user location
  useEffect(() => {
    if (didInit.current) return; // prevent StrictMode double run
    didInit.current = true;// mark as initialized

    // use geolocation to set map center
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => { // on success
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; // get coords
        setCenter(c); // set map center
        setCity('Near you'); // set city name
        await fetchFirst('lodging', c.lat, c.lng); // fetch first lodging results
      },
      (err) => {
        console.warn('geolocation failed', err); // log geolocation error
      }
    );
  }, []);

  //City search handler - when user selects a city
  async function onCitySelect(pick: CityPick) {
    const c = { lat: pick.lat, lng: pick.lng }; // construct center from pick
    setCenter(c); // set map center
    setCity(pick.name); // set city name
    setSelected('lodging'); // reset selected category to lodging
    setPage(1); // reset pagination to page 1
    setState({ // reset state for all categories
      lodging: { rows: [], nextPageToken: null, loaded: false },
      dining: { rows: [], nextPageToken: null, loaded: false },
      attractions: { rows: [], nextPageToken: null, loaded: false },
    });
    await fetchFirst('lodging', c.lat, c.lng); // fetch first lodging results
  }

  // switching categories
  useEffect(() => {
    if (!center) return; // require center
    if (!state[selected].loaded) fetchFirst(selected, center.lat, center.lng); // fetch if not loaded
  }, [selected, center]); // dependencies: selected category, center

  //Paging
  const pageSize = 9; // fixed page size
  const rows: PlaceRow[] = useMemo(() => {// compute rows for current page and category
    const all = state[selected].rows; // all rows for selected category
    const start = (page - 1) * pageSize; // calculate start index
    return all.slice(start, start + pageSize); // return sliced rows for current page
  }, [state, selected, page]); // dependencies: state, selected category, page

  // total results for selected category
  const totalSelected = state[selected].rows.length;

  // open modal for a place
  function openModal(p: PlaceRow) {
    setActive(p); // set active place
    setModalOpen(true); // open modal
  }

  // add place to itinerary handler
  // this still needs work done!!!!!!!
  async function onAdd(details: PlaceDetails) {
    if (!itineraryId) { // require itineraryId
      alert('Open this page with ?itineraryid=...'); // alert if missing
      return; // exit
    }
    try {
      await addItineraryLocation(itineraryId, details.id); // store ONLY Google place id
      setModalOpen(false); // close modal
      alert(`Added: ${details.name}`); // alert success
    } catch (e: any) { // error handling
      if (e?.code === '23505') alert('That place is already in this itinerary.'); // unique violation
      else alert('Failed to add (see console).'); // generic error
      console.error(e); // log error
    }
  }

  // sign out handler
  async function signOut() {
    try {// try block for sign out
      await supabase.auth.signOut({ scope: 'global' });// sign out call
    } finally { // finally block for cleanup
      try { // try block for local storage cleanup
        for (const k of Object.keys(localStorage)) if (k.startsWith('sb-')) localStorage.removeItem(k); // remove sb- keys
      } catch {}
      window.location.assign('/signin?signedout=1'); // redirect to sign-in page
    }
  }

  // Render UI 
  return (
    <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
      <Link href="/home">Home</Link>
      <h1 style={{ marginBottom: 0 }}>Itinerary Details (Create)</h1>
      <p style={{ marginTop: 4, opacity: 0.8 }}>
        Pick a city (defaults to your location), then switch categories and add places.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        <CategorySidebar
          selected={selected}
          onSelect={(c) => {
            setSelected(c);
            setPage(1);
          }}
          disabled={!center || loading}
        />

        <section style={{ display: 'grid', gap: 16 }}>
          <header style={{ display: 'grid', gap: 8 }}>
            <CitySearch onCity={onCitySelect} />
            {center && (
              <p style={{ margin: 0 }}>
                Showing <strong>{selected}</strong> near <strong>{city}</strong>
              </p>
            )}
          </header>

          {loading && !state[selected].loaded && <p>Loading…</p>}

          {state[selected].rows.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                {rows.map((p) => (
                  <PlaceCard key={p.id} place={p} onClick={openModal} />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div />
                <Pagination page={page} pageSize={pageSize} total={totalSelected} onPage={setPage} />
                <div />
              </div>

              {state[selected].nextPageToken && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => fetchMore(selected)} disabled={loading}>
                    {loading ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && state[selected].loaded && state[selected].rows.length === 0 && (
            <p>No results for this area.</p>
          )}
        </section>
      </div>

      <PlaceModal open={modalOpen} place={active} onClose={() => setModalOpen(false)} onAdd={onAdd} />

      <button onClick={signOut} style={{ padding: '8px 12px', marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}
