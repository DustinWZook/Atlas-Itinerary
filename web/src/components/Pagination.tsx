'use client';

export default function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Prev
      </button>
      <span style={{ opacity: 0.8 }}>
        Page {page} / {pages}
      </span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
