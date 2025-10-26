'use client';

import type { PlaceRow } from '@/lib/shared/types';
import { photoUrl } from '@/lib/shared/photo';

export default function PlaceCard({
  place,
  onClick,
}: {
  place: PlaceRow;
  onClick: (p: PlaceRow) => void;
}) {
  const img = photoUrl(place.photoName, 400, 260);

  return (
    <button
      onClick={() => onClick(place)}
      style={{
        textAlign: 'left',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div style={{ aspectRatio: '4 / 2.6', background: '#f3f4f6' }}>
        {img ? (
          <img
            src={img}
            alt={place.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : null}
      </div>
      <div style={{ padding: '0.75rem 1rem' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{place.name}</div>
        <div style={{ opacity: 0.8, fontSize: 14 }}>{place.address}</div>
      </div>
    </button>
  );
}
