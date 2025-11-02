'use client';

import { useEffect, useMemo, useState } from 'react';
import CitySearch from '@/components/CitySearch';
import type { CityPick } from '@/lib/shared/types';
import { createItinerary } from '@/lib/repos/itineraries';

export default function CreateItineraryModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (itineraryId: string) => void;
}) {
  // form state
  const [name, setName] = useState('');
  const [cityPick, setCityPick] = useState<CityPick | null>(null); // from CitySearch
  const [cityText, setCityText] = useState(''); // manual fallback text
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // whenever a city is picked from autocomplete, mirror it to the text field so users see something
  useEffect(() => {
    if (cityPick?.name) setCityText(cityPick.name);
  }, [cityPick]);

  // live validation (shows why button is disabled)
  const errors = useMemo(() => {
    const e: string[] = [];
    if (!name.trim()) e.push('Enter a name.');
    if (!cityText.trim()) e.push('Choose a destination (pick from list or type a city).');
    if (!start) e.push('Pick a start date.');
    if (!end) e.push('Pick an end date.');
    if (start && end && new Date(start) > new Date(end)) e.push('Start date must be before or equal to end date.');
    return e;
  }, [name, cityText, start, end]);

  const canSubmit = errors.length === 0 && !submitting;

  async function handleCreate() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const dest = cityText.trim(); // schema only needs a string
      const { itineraryid } = await createItinerary({
        name: name.trim(),
        traveldestination: dest,
        startdate: start,
        enddate: end,
      });
      onClose();
      onCreated?.(itineraryid);
    } catch (e: any) {
      console.error(e);
      // helpful RLS hint
      if (e?.message?.toLowerCase?.().includes('row level security')) {
        alert('Failed to create itinerary. Check Supabase RLS insert policy on "itineraries" for authenticated users.');
      } else {
        alert(e?.message || 'Failed to create itinerary.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // reset the form whenever the modal opens fresh
  useEffect(() => {
    if (open) {
      setName('');
      setCityPick(null);
      setCityText('');
      setStart('');
      setEnd('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 92vw)',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          padding: 20,
          display: 'grid',
          gap: 14,
        }}
      >
        <h2 style={{ margin: 0 }}>Create new itinerary</h2>

        {/* Name */}
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Spring Break 2026"
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
          />
        </label>

        {/* Destination (picker + fallback text) */}
        <div style={{ display: 'grid', gap: 8 }}>
          <span>Destination (city)</span>
          <CitySearch onCity={setCityPick} />
          <input
            value={cityText}
            onChange={(e) => setCityText(e.target.value)}
            placeholder="Or type a city (e.g., Nashville, TN)"
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
          />
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Start date</span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>End date</span>
            <input
              type="date"
              value={end}
              min={start || undefined}
              onChange={(e) => setEnd(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
            />
          </label>
        </div>

        {/* Validation helper */}
        {errors.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 18, color: '#b91c1c', fontSize: 13 }}>
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button onClick={onClose} disabled={submitting} style={{ padding: '8px 12px' }}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canSubmit}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #1f2937',
              background: canSubmit ? '#111827' : '#9ca3af',
              color: '#fff',
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
