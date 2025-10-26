'use client';


import type { Category } from '@/lib/shared/types';


//Record<Category, string> guarantees we cover all valid categories
const LABELS: Record<Category, string> = { /** */
  lodging: 'Lodging',
  dining: 'Dining',
  attractions: 'Attractions'
};
 

export default function CategorySidebar({
  selected,
  onSelect,
  disabled
}: {
  selected: Category;
  onSelect: (c: Category) => void;
  disabled?: boolean;
}) {
  const cats: Category[] = ['lodging', 'dining', 'attractions'];

  return (
    <nav
      style={{
        width: 220,
        borderRight: '1px solid #e5e7eb',
        padding: '1rem',
        display: 'grid',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
        height: '100%',
        background: '#fff'
      }}
    >
      <h3 style={{ margin: 0 }}>Categories</h3>
      {cats.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          disabled={!!disabled}
          style={{
            textAlign: 'left',
            padding: '0.6rem 0.8rem',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: c === selected ? '#f3f4f6' : '#fff',
            fontWeight: c === selected ? 600 : 500,
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {LABELS[c]}
        </button>
      ))}
    </nav>
  );
}
