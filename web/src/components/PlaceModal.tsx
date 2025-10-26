'use client';

import { useEffect, useState } from 'react';
import type { PlaceDetails, PlaceRow } from '@/lib/shared/types';
import { photoUrl } from '@/lib/shared/photo';

export default function PlaceModal({
  open,
  place,
  onClose,
  onAdd,
}: {
  open: boolean;
  place: PlaceRow | null;
  onClose: () => void;
  onAdd: (p: PlaceDetails) => void;
}) {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !place) return;
    setLoading(true);
    setDetails(null);
    fetch(`/api/locations/${encodeURIComponent(place.id)}`)
      .then((r) => r.json())
      .then((d: PlaceDetails) => setDetails(d))
      .finally(() => setLoading(false));
  }, [open, place]);

  if (!open || !place) return null;

  const heroName = (details?.photos?.[0] ?? place.photoName) || '';
  const hero = photoUrl(heroName, 1000, 420);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(900px, 96vw)',
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        {hero ? (
          <img
            src={hero}
            alt={place.name}
            style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
          />
        ) : null}

        <div style={{ padding: 20, display: 'grid', gap: 8 }}>
          <h3 style={{ margin: 0 }}>{details?.name ?? place.name}</h3>
          <div style={{ opacity: 0.8 }}>{details?.address ?? place.address}</div>

          {loading ? (
            <p>Loading details…</p>
          ) : (
            <>
              {details?.description && <p>{details.description}</p>}

              {details?.openingHours?.length ? (
                <div>
                  <strong>Hours</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                    {details.openingHours.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                {details?.websiteUri && (
                  <a href={details.websiteUri} target="_blank" rel="noreferrer">
                    Website
                  </a>
                )}
                <a href={details?.mapUrl ?? place.mapUrl} target="_blank" rel="noreferrer">
                  View on Google Maps
                </a>
                {details?.phone && <span>Phone: {details.phone}</span>}
                {typeof details?.rating === 'number' && (
                  <span>
                    Rating: {details.rating} ({details.userRatingCount ?? 0})
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: 16,
            borderTop: '1px solid #eee',
          }}
        >
          <button onClick={onClose} style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid #ddd' }}>
            Cancel
          </button>
          <button
            onClick={() => details && onAdd(details)}
            disabled={!details}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: 10,
              border: '1px solid #2563eb',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              opacity: details ? 1 : 0.6,
            }}
          >
            Add to itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
