'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/shared/supabaseClient';

type ItineraryRow = {
  itineraryid: string;
  name: string;
  traveldestination: string | null;
};

export default function ItineraryPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (id: string, dest?: string | null) => void;
  disabled?: boolean;
}) {
  const supabase = createSupabaseClient();
  const [items, setItems] = useState<ItineraryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) { setItems([]); return; }

        const { data, error } = await supabase
          .from('itineraries')
          .select('itineraryid,name,traveldestination')
          .eq('user_id', userId)
          .order('startdate', { ascending: true });

        if (error) throw error;
        setItems(data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  return (
    <select
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const row = items.find(i => i.itineraryid === id);
        onChange(id, row?.traveldestination ?? undefined);
      }}
      disabled={disabled || loading || items.length === 0}
      style={{ padding: '8px 10px', minWidth: 260, borderRadius: 8 }}
      aria-label="Choose itinerary"
    >
      <option value="" disabled>
        {loading ? 'Loading itineraries…' : 'Select an itinerary'}
      </option>
      {items.map(i => (
        <option key={i.itineraryid} value={i.itineraryid}>
          {i.name}
          {i.traveldestination ? ` — ${i.traveldestination}` : ''}
        </option>
      ))}
    </select>
  );
}
