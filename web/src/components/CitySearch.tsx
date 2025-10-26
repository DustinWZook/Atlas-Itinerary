'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { CityPick } from '@/lib/shared/types';

export default function CitySearch({ onCity }: { onCity: (c: CityPick) => void }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !hostRef.current) return;

    const g = (window as any).google;
    if (!g?.maps?.places?.PlaceAutocompleteElement) return;

    // autocomplete element
    const el = new g.maps.places.PlaceAutocompleteElement({
      includedPrimaryTypes: ['locality'],
    });
    hostRef.current.appendChild(el);

    const handle = async (ev: any) => {
      const place =
        ev?.detail?.place ??
        ev?.place ??
        (ev?.placePrediction?.toPlace ? ev.placePrediction.toPlace() : null);
      if (!place) return;

      await place.fetchFields({ fields: ['displayName', 'location'] });

      const name = String(place.displayName?.text ?? place.displayName ?? '');
      const loc = place.location;
      const lat =
        typeof loc?.lat === 'function' ? loc.lat() : (loc?.lat ?? loc?.latitude);
      const lng =
        typeof loc?.lng === 'function' ? loc.lng() : (loc?.lng ?? loc?.longitude);

      if (name && typeof lat === 'number' && typeof lng === 'number') {
        onCity({ name, lat, lng });
      }
    };

    el.addEventListener('gmp-placeselect', handle);
    el.addEventListener('gmp-select', handle);

    return () => {
      try {
        el.removeEventListener('gmp-placeselect', handle);
        el.removeEventListener('gmp-select', handle);
      } catch {}
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, [ready, onCity]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={hostRef} />
    </>
  );
}