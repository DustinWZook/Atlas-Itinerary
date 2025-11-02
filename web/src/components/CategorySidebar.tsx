'use client';

import type { Category } from '@/lib/shared/types';


const LABELS: Record<Category, string> = {
  lodging: 'Lodging',
  dining: 'Dining',
  attractions: 'Attractions',
};


export default function CategorySidebar({
  selected,
  onSelect,
  disabled,
}: {
  selected: Category;
  onSelect: (c: Category) => void;
  disabled?: boolean;
}) {
  const cats: Category[] = ['lodging', 'dining', 'attractions'];
  const SIDEBAR_W = 160;

  return (
    <nav
      style={{
        width: SIDEBAR_W,
        borderRight: '1px solid #e5e7eb',
        padding: '0.75rem',
        display: 'grid',
        gap: '0.4rem',
        position: 'sticky',
        top: 0,
        alignSelf: 'start',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 .25rem' }}>
        Categories
      </div>

      {cats.map((c) => {
        const isActive = c === selected;
        return (
          <button
            key={c}
            onClick={() => onSelect(c)}
            disabled={!!disabled}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.45rem 0.6rem',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: isActive ? '#f5f6f8' : '#fff',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              lineHeight: 1.2,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {LABELS[c]}
          </button>
        );
      })}
    </nav>
  );
}
