'use client';

import { useState } from 'react';
import CreateItineraryModal from '@/components/CreateItineraryModal';

export default function CreateItineraryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '8px 14px',
          borderRadius: 10,
          border: '1px solid #1f2937',
          background: '#111827',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        + Create Itinerary
      </button>

      <CreateItineraryModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
