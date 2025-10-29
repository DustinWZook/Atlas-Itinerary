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
  // used when adding a place to an itinerary
  const [itineraryId, setItineraryId] = useState(''); // holds ?itineraryid=... from the URL
  useEffect(() => {
    // Read the query string once on mount; avoids Suspense requirement for useSearchParams
    const qs = new URLSearchParams(window.location.search);
    setItineraryId(qs.get('itineraryid') ?? '');
  }, []);

  // State
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null); // map/search center
  const [city, setCity] = useState('Near you'); // display name of current city/area
  const [selected, setSelected] = useState<Category>('lodging'); // selected category tab
  const [loading, setLoading] = useState(false); // loading flag for API calls
  const [page, setPage] = useState(1); // current pagination page

  const [modalOpen, setModalOpen] = useState(false); // modal open/close
  const [active, setActive] = useState<PlaceRow | null>(null); // active place in modal

  // Per-category result state
  type CatState = { rows: PlaceRow[]; nextPageToken: string | null; loaded: boolean };
  // initialized empty; loaded indicates if first fetch has completed
  const [state, setState] = useState<Record<Category, CatState>>({
    lodging: { rows: [], nextPageToken: null, loaded: false },
    dining: { rows: [], nextPageToken: null, loaded: false },
    attractions: { rows: [], nextPageToken: null, loaded: false },
  });



  // fetch first page of results for a category
  async function fetchFirst(cat: Category, lat: number, lng: number) {
    setLoading(true); // set loading state true
    try {
      const res = await fetch('/api/places', {
        method: 'POST', // POST method
        headers: { 'Content-Type': 'application/json' }, // JSON header
        body: JSON.stringify({ lat, lng, category: cat, pageSize: 20 }), // request body
      });

      // handle non-ok response
      if (!res.ok) {
        console.error('API /api/places failed', res.status, await res.text()); // log error
        return;
      }

      // parse response JSON and update state
      const { rows, nextPageToken } = await res.json(); // parse json response
      setState((s) => ({ ...s, [cat]: { rows, nextPageToken, loaded: true } })); // update results
    } finally {
      setLoading(false); // always turn off loading
    }
  }

  // fetch more results for a category (pagination)
  async function fetchMore(cat: Category) {
    const st = state[cat]; // get current state for category
    if (!center || !st.nextPageToken) return; // require center and nextPageToken
    setLoading(true); // set loading state true
    try {
      const res = await fetch('/api/places', {
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
      setState((s) => ({
        ...s, // spread existing state
        [cat]: { rows: [...s[cat].rows, ...rows], nextPageToken, loaded: true }, // append rows
      }));
    } finally {
      setLoading(false); // reset loading state
    }
  }

  const didInit = useRef(false); // prevent StrictMode double-run to keep API calls minimal

  useEffect(() => {
    if (didInit.current) return; // prevent double-run
    didInit.current = true; // mark as initialized

    // Helper to run the first search when we have coordinates
    const run = async (lat: number, lng: number, name: string) => {
      const c = { lat, lng };
      setCenter(c);
      setCity(name);
      await fetchFirst('lodging', lat, lng);
    };

    if (!('geolocation' in navigator)) {
      // No geolocation available -> do nothing; user must pick a city
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await run(pos.coords.latitude, pos.coords.longitude, 'Near you'); // success path
      },
      (err) => {
        console.warn('geolocation failed', err);
        // Do nothing here; user will pick a city in the search box
        // (center remains null; categories remain disabled until center set)
      }
    );
  }, []);

  // City search handler - when user selects a city from autocomplete
  async function onCitySelect(pick: CityPick) {
    const c = { lat: pick.lat, lng: pick.lng }; // construct center from pick
    setCenter(c); // set center
    setCity(pick.name); // set city label
    setSelected('lodging'); // reset selected category to lodging
    setPage(1); // reset pagination to page 1
    setState({
      lodging: { rows: [], nextPageToken: null, loaded: false },
      dining: { rows: [], nextPageToken: null, loaded: false },
      attractions: { rows: [], nextPageToken: null, loaded: false },
    }); // clear prior results for a fresh search
    await fetchFirst('lodging', c.lat, c.lng); // fetch lodging first
  }

  // Switching categories: load data on-demand for the selected tab
  useEffect(() => {
    if (!center) return; // need a center (either via geo success or user pick)
    if (!state[selected].loaded) fetchFirst(selected, center.lat, center.lng); // fetch if not loaded yet
  }, [selected, center]); // dependencies: selected category, center

  // Paging
  const pageSize = 9; // fixed page size for grid
  const rows: PlaceRow[] = useMemo(() => {
    const all = state[selected].rows; // all rows for selected category
    const start = (page - 1) * pageSize; // calculate start index
    return all.slice(start, start + pageSize); // current page slice
  }, [state, selected, page]);

  // total results for selected category (for Pagination)
  const totalSelected = state[selected].rows.length;

  // open modal for a place
  function openModal(p: PlaceRow) {
    setActive(p); // set active place
    setModalOpen(true); // open modal
  }

  // add place to itinerary handler
  async function onAdd(details: PlaceDetails) {
    if (!itineraryId) {
      alert('Open this page with ?itineraryid=...'); // require itineraryId
      return;
    }
    try {
      await addItineraryLocation(itineraryId, details.id); // store ONLY Google place id
      setModalOpen(false); // close modal
      alert(`Added: ${details.name}`); // success toast
    } catch (e: any) {
      if (e?.code === '23505') alert('That place is already in this itinerary.'); // unique violation
      else alert('Failed to add (see console).'); // generic error
      console.error(e);
    }
  }

  // sign out handler
  async function signOut() {
    try {
      await supabase.auth.signOut({ scope: 'global' }); // sign out call
    } finally {
      try {
        for (const k of Object.keys(localStorage)) if (k.startsWith('sb-')) localStorage.removeItem(k); // remove sb- keys
      } catch {}
      window.location.assign('/signin?signedout=1'); // redirect to sign-in page
    }
  }

  // --- Render UI ---
  return (
    <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
      <Link href="/home">Home</Link>
      <h1 style={{ marginBottom: 0 }}>Itinerary Details (Create)</h1>
      <p style={{ marginTop: 4, opacity: 0.8 }}>
        Pick a city (or allow geolocation), then switch categories and add places.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        <CategorySidebar
          selected={selected}
          onSelect={(c) => {
            setSelected(c);
            setPage(1);
          }}
          disabled={!center || loading} // disabled until a center exists
        />

        <section style={{ display: 'grid', gap: 16 }}>
          <header style={{ display: 'grid', gap: 8 }}>
            <CitySearch onCity={onCitySelect} />
            {!center && (
              <small style={{ opacity: 0.7 }}>
                Tip: pick a city from the dropdown to start (typing alone doesn’t run a search).
              </small>
            )}
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

          
          {!center && !loading && <p style={{ opacity: 0.8 }}>Pick a city to start.</p>}
          {center && !loading && state[selected].loaded && state[selected].rows.length === 0 && (
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
