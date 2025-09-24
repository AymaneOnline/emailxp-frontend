import React, { useEffect, useState, useCallback } from 'react';
import subscriberService from '../services/subscriberService';

const SubscriberPicker = ({ selected = [], onChange, pageSize = 50, className = '' }) => {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(null);
  const [selectAllVisible, setSelectAllVisible] = useState(false);

  const fetchPage = useCallback(async (query, pageIndex) => {
    setLoading(true);
    setError(null);
    try {
      const params = { q: query || undefined, limit: pageSize, offset: pageIndex * pageSize };
      const data = await subscriberService.getSubscribers(params);
      // try to detect total if backend returned meta
      if (data && data.length && typeof data.length === 'number') {
        setResults(data);
        // backend may return an object with { subscribers, total }
        if (data.total) setTotal(data.total);
        else setTotal(null);
      } else {
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Failed to load subscribers');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchPage(q, 0);
    }, 300);
    return () => clearTimeout(t);
  }, [q, fetchPage]);

  // initial load
  useEffect(() => {
    fetchPage('', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
    if (onChange) onChange(next);
  };

  const selectAll = () => {
    const visibleIds = results.map(r => r._id || r.id).filter(Boolean);
    const next = Array.from(new Set([...selected, ...visibleIds]));
    if (onChange) onChange(next);
  };

  const clearSelection = () => {
    if (onChange) onChange([]);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subscribers" className="border rounded px-3 py-2 w-full" />
        <button onClick={() => { setQ(''); setPage(0); fetchPage('', 0); }} className="px-3 py-2 bg-gray-100 rounded">Clear</button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">{loading ? 'Loading…' : `${results.length} shown${total ? ` — ${total} total` : ''}`}</div>
        <div className="flex items-center gap-2">
          <button onClick={selectAll} className="px-2 py-1 text-sm bg-blue-50 border rounded">Select visible</button>
          <button onClick={clearSelection} className="px-2 py-1 text-sm bg-gray-50 border rounded">Clear</button>
        </div>
      </div>

      <div className="mt-2 max-h-56 overflow-auto border rounded p-2 bg-white">
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && results.length === 0 && <div className="text-sm text-gray-500">No subscribers found.</div>}
        {results.map((s) => {
          const id = s._id || s.id;
          return (
            <label key={id} className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
                <div>
                  <div className="text-sm font-medium">{s.email}</div>
                  <div className="text-xs text-gray-500">{[s.firstName, s.lastName].filter(Boolean).join(' ')}</div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page + 1}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => { const p = Math.max(0, page - 1); setPage(p); fetchPage(q, p); }} className="px-2 py-1 bg-gray-100 rounded" disabled={page === 0}>Prev</button>
          <button onClick={() => { const p = page + 1; setPage(p); fetchPage(q, p); }} className="px-2 py-1 bg-gray-100 rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default SubscriberPicker;
