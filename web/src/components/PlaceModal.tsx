'use client';

import { useEffect, useState } from 'react';
import type { PlaceDetails, PlaceRow } from '@/lib/shared/types';
import { photoUrl } from '@/lib/shared/photo';
import styles from '@/css/PlaceModal.module.css';


type AddOpts = {
  startdate: string | null;
  enddate: string | null;
  starttime: string | null;
  endtime: string | null;
};

export default function PlaceModal({
  open,
  place,
  onClose,
  onAdd,
}: {
  open: boolean;
  place: PlaceRow | null;
  onClose: () => void;
  onAdd: (details: PlaceDetails, opts: AddOpts) => void;
}) {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // responsive flag (≤ 640px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 640px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches);
    onChange(mql); // set initial
    mql.addEventListener?.('change', onChange as any);
    return () => mql.removeEventListener?.('change', onChange as any);
  }, []);

  // fetch details when opened
  useEffect(() => {
    if (!open || !place) return;
    setLoading(true);
    setDetails(null);
    fetch(`/api/locations/${encodeURIComponent(place.id)}`)
      .then((r) => r.json())
      .then((d: PlaceDetails) => setDetails(d))
      .finally(() => setLoading(false));
  }, [open, place]);

  // simple inputs
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  if (!open || !place) return null;

  const heroName = (details?.photos?.[0] ?? place.photoName) || '';
  const hero = photoUrl(heroName, 1000, 420);

return (
  <div
    role="dialog"
    aria-modal="true"
    // close only if the user clicks the backdrop itself
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    className={styles['placeModal-backdrop']}
  >
    <div className={styles['placeModal-sheet']}>
      {hero ? (
        <img
          src={hero}
          alt={details?.name ?? place?.name ?? 'cover'}
          className={styles['placeModal-hero']}
        />
      ) : null}

      <div className={styles['placeModal-body']}>
        {/* Title / address / rating */}
        <section className={styles['placeModal-headerBlock']}>
          <h2 className={styles['placeModal-title']}>
            {details?.name ?? place?.name}
          </h2>

          {(details?.address ?? place?.address) && (
            <p className={styles['placeModal-subtle']}>
              {details?.address ?? place?.address}
            </p>
          )}

          {!!(details?.rating ?? place?.rating) && (
            <p className={styles['placeModal-subtle']}>
              {(details?.rating ?? place?.rating)?.toString()}
              {details?.userRatingCount ? ` (${details.userRatingCount})` : ''}
            </p>
          )}
        </section>

        {!!details?.description && (
          <p className={styles['placeModal-desc']}>{details.description}</p>
        )}

        {/* Links */}
        <div className={styles['placeModal-linksRow']}>
          {details?.websiteUri && (
            <a href={details.websiteUri} target="_blank" rel="noreferrer">
              Website
            </a>
          )}
          {(details?.mapUrl ?? place?.mapUrl) && (
            <a
              href={(details?.mapUrl ?? place?.mapUrl)!}
              target="_blank"
              rel="noreferrer"
            >
              Google Maps
            </a>
          )}
          {details?.phone && <span>{details.phone}</span>}
        </div>

        {/* Form (under links) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!details) return;
            onAdd(details, {
              startdate: startDate || null,
              enddate:   endDate   || null,
              starttime: startTime || null,
              endtime:   endTime   || null,
            });
          }}
          className={styles['placeModal-form']}
        >
          <label className={styles['placeModal-label']}>
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles['placeModal-input']}
            />
          </label>

          <label className={styles['placeModal-label']}>
            Start time
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles['placeModal-input']}
            />
          </label>

          <label className={styles['placeModal-label']}>
            End date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles['placeModal-input']}
            />
          </label>

          <label className={styles['placeModal-label']}>
            End time
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={styles['placeModal-input']}
            />
          </label>

          <button
            type="submit"
            disabled={loading || !details}
            className={styles['placeModal-addBtn']}
          >
            {loading ? 'Saving…' : 'Add to itinerary'}
          </button>
        </form>

        {/* Footer */}
        <div className={styles['placeModal-closeRow']}>
          <button onClick={onClose} className={styles['placeModal-closeBtn']}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);




}
