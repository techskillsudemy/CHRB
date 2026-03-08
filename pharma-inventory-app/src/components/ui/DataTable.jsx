// src/components/ui/DataTable.jsx
import { useState, useMemo } from 'react';

export default function DataTable({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Rechercher…',
  emptyMessage = 'Aucune donnée disponible',
  rowClassName,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filteredData = useMemo(() => {
    let result = data || [];
    if (searchable && search) {
      const s = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : '';
          return String(val).toLowerCase().includes(s);
        })
      );
    }
    if (sortKey) {
      const col = columns.find((c) => (c.key || c.accessor) === sortKey);
      if (col) {
        result = [...result].sort((a, b) => {
          const aVal = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor];
          const bVal = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor];
          if (aVal == null) return 1;
          if (bVal == null) return -1;
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return result;
  }, [data, search, sortKey, sortDir, columns, searchable]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-premium w-full max-w-sm"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-premium">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.accessor}
                  className={`text-left ${
                    col.sortable !== false ? 'cursor-pointer hover:text-accent select-none' : ''
                  } ${col.className || ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key || col.accessor)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {sortKey === (col.key || col.accessor) && (
                      <span className="text-accent">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={rowClassName ? rowClassName(row) : ''}
                >
                  {columns.map((col) => (
                    <td key={col.key || col.accessor} className={`px-4 py-3 ${col.cellClassName || ''}`}>
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
