'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import CitySearch from '@/components/CitySearch';
import CategorySidebar from '@/components/CategorySidebar';
import PlaceCard from '@/components/PlaceCard';
import PlaceModal from '@/components/PlaceModal';
import CreateItineraryButton from '@/components/CreateItineraryButton';
import ItineraryPicker from '@/components/ItineraryPicker';

import type { Category, CityPick, PlaceDetails, PlaceRow } from '@/lib/shared/types';
import { addItineraryLocation } from '@/lib/repos/locations';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

// Main Itinerary Details Page
export default function ItineraryDetailsPage() {
  const supabase = createSupabaseClient();

  // Itinerary ID from query string (read once without Suspense)
  const [itineraryId, setItineraryId] = useState(''); // holds ?itineraryid=...
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setItineraryId(qs.get('itineraryid') ?? '');
  }, []);

  // keep selected itinerary in state + URL
  function setItineraryAndUrl(id: string) {
    setItineraryId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('itineraryid', id);
    else url.searchParams.delete('itineraryid');
    window.history.replaceState({}, '', url);
  }

  // State
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null); // user geo center if allowed
  const [city, setCity] = useState(''); // typed or selected city name
  const [selected, setSelected] = useState<Category>('lodging'); // current category
  const [loading, setLoading] = useState(false); // loading spinner flag
  const [page, setPage] = useState(1); // client-side pagination page
  const [modalOpen, setModalOpen] = useState(false); // place details modal open
  const [active, setActive] = useState<PlaceRow | null>(null); // active place for modal
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // small error message

  // category data cache so switching tabs doesn’t refetch every time
  type CatState = { rows: PlaceRow[]; nextPageToken: string | null; loaded: boolean };
  const [state, setState] = useState<Record<Category, CatState>>({
    lodging: { rows: [], nextPageToken: null, loaded: false },
    dining: { rows: [], nextPageToken: null, loaded: false },
    attractions: { rows: [], nextPageToken: null, loaded: false },
  });

  
  const useGeo = !!center; // if we have geolocation then auto-populate
  const canQuery = useGeo || !!city;  // must have either geo OR city to query

  // One-time init guard avoid StrictMode double-fetch
  const didInit = useRef(false);

  // try geolocation default
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(c);// set user center
        setCity('');// clear any city string
        // auto-fetch default category (lodging)
        await fetchFirst('lodging', { center: c });
      },
      (err) => {
        // If user denies location, do nothing; they can still type a city.
        console.warn('geolocation denied/unavailable', err);
      }
    );
  }, []);

  // City search handler - when user picks a city from the CitySearch component
  async function onCitySelect(pick: CityPick) {
    const c = { lat: pick.lat, lng: pick.lng }; // construct center from pick
    setCenter(c);// use geo for better precision
    setCity(pick.name);// show the city name in the header
    setSelected('lodging'); // reset selected category to lodging
    setPage(1);// reset pagination to page 1
    // reset state for all categories
    setState({
      lodging: { rows: [], nextPageToken: null, loaded: false },
      dining: { rows: [], nextPageToken: null, loaded: false },
      attractions: { rows: [], nextPageToken: null, loaded: false },
    });
    await fetchFirst('lodging', { center: c }); // fetch first lodging results
  }

  // first page for a category using either geo or city
  async function fetchFirst(cat: Category, where: { center?: {lat:number;lng:number}; city?: string }) {
    if (!where.center && !where.city) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const body: any = { category: cat, pageSize: 20 };
      if (where.center) { body.lat = where.center.lat; body.lng = where.center.lng; }
      if (where.city)   { body.city = where.city; }

      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('API /api/places failed', res.status, txt);
        setErrorMsg(txt || 'Search failed');
        return;
      }

      const { rows, nextPageToken } = await res.json();
      setState((s) => ({ ...s, [cat]: { rows, nextPageToken, loaded: true } }));
    } finally {
      setLoading(false);
    }
  }

  // Fetch more for current category (pagination)
  async function fetchMore(cat: Category) {
    const st = state[cat];
    if (!st.nextPageToken) return;
    if (!canQuery) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const body: any = {
        category: cat,
        pageSize: 20,
        pageToken: st.nextPageToken,
      };
      if (useGeo && center) { body.lat = center.lat; body.lng = center.lng; }
      else if (city)        { body.city = city; }

      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('API /api/places failed', res.status, txt);
        setErrorMsg(txt || 'Load more failed');
        return;
      }

      const { rows, nextPageToken } = await res.json();
      setState((s) => ({
        ...s,
        [cat]: { rows: [...s[cat].rows, ...rows], nextPageToken, loaded: true },
      }));
    } finally {
      setLoading(false);
    }
  }

  // When user clicks a different category in the sidebar, dynamically fetch if not loaded
  useEffect(() => {
    if (!canQuery) return; // need geo or city
    if (!state[selected].loaded) {
      if (useGeo && center) fetchFirst(selected, { center });
      else if (city)        fetchFirst(selected, { city });
    }
  }, [selected, canQuery, useGeo, center, city]); // re-run when these change

  // Client-side 9-per-page slice
  const pageSize = 9; // fixed page size
  const rows: PlaceRow[] = useMemo(() => {
    const all = state[selected].rows; // all rows for selected category
    const start = (page - 1) * pageSize; // calculate start index
    return all.slice(start, start + pageSize); // return sliced rows for current page
  }, [state, selected, page]);

  const totalSelected = state[selected].rows.length;

  // Open the modal
  function openModal(p: PlaceRow) {
    setActive(p); // set active place
    setModalOpen(true); // open modal
  }

  // Add place to itinerary
  async function onAdd(details: PlaceDetails) {
    if (!itineraryId) { // require itineraryId
      alert('Open this page with ?itineraryid=...');
      return;
    }
    try {
      await addItineraryLocation(itineraryId, details.id); // store ONLY Google place id
      setModalOpen(false);
      alert(`Added: ${details.name}`);
    } catch (e: any) {
      if (e?.code === '23505') alert('That place is already in this itinerary.');
      else alert('Failed to add (see console).');
      console.error(e);
    }
  }


  async function onItineraryPicked(id: string) {
    setItineraryAndUrl(id);
    if (!id) return;

    const { data, error } = await supabase
      .from('itineraries')
      .select('traveldestination')
      .eq('itineraryid', id)
      .single();

    if (error) {
      console.error('Failed to load itinerary', error);
      return;
    }
    const dest = (data?.traveldestination || '').trim();
    if (!dest) return;

    // update page to the selected destination
    setCenter(null);
    setCity(dest);
    setSelected('lodging');
    setPage(1);
    setState({
      lodging: { rows: [], nextPageToken: null, loaded: false },
      dining:  { rows: [], nextPageToken: null, loaded: false },
      attractions: { rows: [], nextPageToken: null, loaded: false },
    });
    await fetchFirst('lodging', { city: dest });
  }

  // Sign out
  async function signOut() {
    try { await supabase.auth.signOut({ scope: 'global' }); }
    finally {
      try { for (const k of Object.keys(localStorage)) if (k.startsWith('sb-')) localStorage.removeItem(k); } catch {}
      window.location.assign('/signin?signedout=1');
    }
  }

  // UI
  return (
    <main style={{ padding: 16, maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
      <Link href="/home">Home</Link>
      <h1 style={{ marginBottom: 0 }}>Itinerary Details (Create)</h1>
      <p style={{ marginTop: 4, opacity: 0.8 }}>
        Pick a city (or allow location), then switch categories and add places.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Itineraries</h1>
        <CreateItineraryButton />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <ItineraryPicker
          value={itineraryId}
          onChange={onItineraryPicked}
        />
      </div>

      {errorMsg && <p style={{ color: '#b91c1c' }}>Error: {errorMsg}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        <CategorySidebar
          selected={selected}
          onSelect={(c) => { setSelected(c); setPage(1); }}
          disabled={loading || !canQuery }
        />

        <section style={{ display: 'grid', gap: 16 }}>
          <header style={{ display: 'grid', gap: 8 }}>
            <CitySearch onCity={onCitySelect} />
            <p style={{ margin: 0 }}>
              Showing <strong>{selected}</strong>{' '}
              {useGeo ? (
                <span>near <strong>your location</strong></span>
              ) : city ? (
                <>in <strong>{city}</strong></>
              ) : (
                <i>(type a city or allow location)</i>
              )}
            </p>
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
                <button onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={page === 1}>Prev</button>
                <span>Page {page} of {Math.max(1, Math.ceil(totalSelected / pageSize))}</span>
                <button
                  onClick={() => setPage((x) => (x * pageSize < totalSelected ? x + 1 : x))}
                  disabled={page * pageSize >= totalSelected}
                >
                  Next
                </button>
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
