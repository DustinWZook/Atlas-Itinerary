'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import CitySearch from '@/components/CitySearch';
import CategorySidebar from '@/components/CategorySidebar';
import PlaceCard from '@/components/PlaceCard';
import PlaceModal from '@/components/PlaceModal';
import CreateItineraryButton from '@/components/CreateItineraryButton';
import ItineraryPicker from '@/components/ItineraryPicker';
import Header from '@/components/Header';
import '@/css/ItineraryDetails.css';
// import '@/css/Header.css'; 


import type { Category, CityPick, PlaceDetails, PlaceRow } from '@/lib/shared/types';
import { addItineraryLocation } from '@/lib/repos/locations';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Main Itinerary Details Page
export default function ItineraryDetailsPage() {
  const supabase = createSupabaseBrowserClient();

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
      lodging: { rows: [], nextPageToken: null, loaded: false },// reset lodging
      dining: { rows: [], nextPageToken: null, loaded: false },// reset dining
      attractions: { rows: [], nextPageToken: null, loaded: false },// reset attractions
    });
    await fetchFirst('lodging', { center: c }); // fetch first lodging results
  }

  // first page for a category using either geo or city
  async function fetchFirst(cat: Category, where: { center?: { lat: number; lng: number }; city?: string }) {
    if (!where.center && !where.city) return;

    setLoading(true);// show loading spinner
    setErrorMsg(null);// clear previous error
    try {
      const body: any = { category: cat, pageSize: 20 };// request body
      if (where.center) { body.lat = where.center.lat; body.lng = where.center.lng; }// use geo if available
      if (where.city) { body.city = where.city; }// use city if available

      // make POST request to /api/places
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // handle non-OK responses
      if (!res.ok) {
        const txt = await res.text();
        console.error('API /api/places failed', res.status, txt);
        setErrorMsg(txt || 'Search failed');
        return;
      }

      // parse response JSON
      const { rows, nextPageToken } = await res.json();
      setState((s) => ({ ...s, [cat]: { rows, nextPageToken, loaded: true } }));// update state with new data
    } finally {
      setLoading(false);// hide loading spinner
    }
  }

  // Fetch more for current category (pagination)
  async function fetchMore(cat: Category) {// fetch next page for category
    const st = state[cat];// current state for category
    if (!st.nextPageToken) return;// no more pages
    if (!canQuery) return;// need geo or city

    setLoading(true);// show loading spinner
    setErrorMsg(null);// clear previous error
    try { // make POST request to /api/places
      const body: any = {
        category: cat,
        pageSize: 20,
        pageToken: st.nextPageToken,
      };
      if (useGeo && center) { body.lat = center.lat; body.lng = center.lng; }// use geo if available
      else if (city) { body.city = city; }// use city if available

      // make POST request to /api/places
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // handle non-OK responses
      if (!res.ok) {
        const txt = await res.text();// read error text
        console.error('API /api/places failed', res.status, txt);// log error
        setErrorMsg(txt || 'Load more failed');// set error message
        return;
      }

      // parse response JSON
      const { rows, nextPageToken } = await res.json();// parse JSON
      setState((s) => ({// update state with new data
        ...s,
        [cat]: { rows: [...s[cat].rows, ...rows], nextPageToken, loaded: true },// append new rows
      }));
    } finally {
      setLoading(false);// hide loading spinner
    }
  }

  // When user clicks a different category in the sidebar, dynamically fetch if not loaded
  useEffect(() => {
    if (!canQuery) return; // need geo or city
    if (!state[selected].loaded) {// not loaded yet
      if (useGeo && center) fetchFirst(selected, { center });// fetch using geo
      else if (city) fetchFirst(selected, { city });// fetch using city
    }
  }, [selected, canQuery, useGeo, center, city]); // re-run when these change

  // Client-side 9-per-page slice
  const pageSize = 9; // fixed page size
  const rows: PlaceRow[] = useMemo(() => {
    const all = state[selected].rows; // all rows for selected category
    const start = (page - 1) * pageSize; // calculate start index
    return all.slice(start, start + pageSize); // return sliced rows for current page
  }, [state, selected, page]);// recompute when state, selected category, or page changes

  const totalSelected = state[selected].rows.length; // total rows for selected category

  // Open the modal
  function openModal(p: PlaceRow) {
    setActive(p); // set active place
    setModalOpen(true); // open modal
  }

  // Add place to itinerary
  async function onAdd(details: PlaceDetails, opts: {
    startdate: string | null;
    enddate: string | null;
    starttime: string | null;
    endtime: string | null;
  }) {
    if (!itineraryId) {
      alert('Please select an itinerary first.');
      return;
    }
    try {
      await addItineraryLocation(itineraryId, details.id, {
        startdate: opts.startdate ?? null,
        enddate: opts.enddate ?? null,
        starttime: opts.starttime ?? null,
        endtime: opts.endtime ?? null,
      });
      alert('Place added to itinerary!');
    } catch (err) {
      console.error('Failed to add place to itinerary', err);
      alert('Failed to add place to itinerary. See console for details.');
    }
      setModalOpen(false);// close modal
    }


  // When user picks a different itinerary
  async function onItineraryPicked(id: string) {
    setItineraryAndUrl(id);// update state and URL
    if (!id) return; // no itinerary selected

    // load itinerary details to get destination city
    // fetch from Supabase
    const { data, error } = await supabase
      .from('itineraries')
      .select('traveldestination')
      .eq('itineraryid', id)
      .single();

      // handle errors
    if (error) {
      console.error('Failed to load itinerary', error);// log error
      return;
    }
    const dest = (data?.traveldestination || '').trim();
    if (!dest) return;// no destination set

    // update page to the selected destination
    setCenter(null);// clear geo center
    setCity(dest);// set city name
    setSelected('lodging');// reset to lodging category
    setPage(1);// reset to page 1
    setState({// reset all category states
      lodging: { rows: [], nextPageToken: null, loaded: false },
      dining: { rows: [], nextPageToken: null, loaded: false },
      attractions: { rows: [], nextPageToken: null, loaded: false },
    });
    await fetchFirst('lodging', { city: dest });// fetch first lodging results for destination
  }

  // Sign out
  async function signOut() {
    try { await supabase.auth.signOut({ scope: 'global' }); }
    finally {
      try { for (const k of Object.keys(localStorage)) if (k.startsWith('sb-')) localStorage.removeItem(k); } catch { }
      window.location.assign('/signin?signedout=1');
    }
  }

  // UI
  return (
    <>
  <main className="it-page">
    <Header onSignOut={signOut} />

    <h1 className="it-h1">Itinerary Details (Create)</h1>
    <p className="it-subtle">
      Pick a city (or allow location), then switch categories and add places.
    </p>

    <div className="it-toolbar">
      <h2 className="it-title">Itineraries</h2>
      <CreateItineraryButton />
    </div>

    <div className="it-itinsRow">
      <ItineraryPicker
        value={itineraryId}
        onChange={onItineraryPicked}
      />
    </div>

    {errorMsg && <p className="it-error">Error: {errorMsg}</p>}

    <div className="it-columns">
      <div className="it-sidebar">
        <CategorySidebar
          selected={selected}
          onSelect={(c) => {
            setSelected(c);
            setPage(1);
          }}
          disabled={loading || !canQuery}
        />
      </div>

      <section className="it-main">
        <header className="it-headerRow">
  <div className="it-cityWrap">
    <CitySearch onCity={onCitySelect} />
  </div>

  <p className="it-context">
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
            <div className="it-resultsGrid">
              {rows.map((p) => (
                <PlaceCard key={p.id} place={p} onClick={openModal} />
              ))}
            </div>

            <div className="it-pager">
              <button
                onClick={() => setPage((x) => Math.max(1, x - 1))}
                disabled={page === 1}
              >
                Prev
              </button>

              <span>
                Page {page} of {Math.max(1, Math.ceil(totalSelected / pageSize))}
              </span>

              <button
                onClick={() =>
                  setPage((x) => (x * pageSize < totalSelected ? x + 1 : x))
                }
                disabled={page * pageSize >= totalSelected}
              >
                Next
              </button>
            </div>

            {state[selected].nextPageToken && (
              <div className="it-loadMore">
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

    <PlaceModal
      open={modalOpen}
      place={active}
      onClose={() => setModalOpen(false)}
      onAdd={onAdd}
    />


  </main>
        
    </>
);

}
