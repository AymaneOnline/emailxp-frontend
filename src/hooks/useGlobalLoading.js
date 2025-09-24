import { useCallback, useEffect, useRef, useState } from 'react';

// Simple global reference counter for loading states
const listeners = new Set();
let refCount = 0;

function emit() {
  for (const l of listeners) l(refCount);
}

export function startGlobalLoading() {
  refCount += 1;
  emit();
  return () => stopGlobalLoading();
}

export function stopGlobalLoading() {
  if (refCount > 0) {
    refCount -= 1;
    emit();
  }
}

export function useGlobalLoadingState() {
  const [count, setCount] = useState(refCount);
  useEffect(() => {
    const listener = (c) => setCount(c);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  return count > 0;
}

// Hook to wrap an async function and automatically manage refCount
export function useTrackedAsync(delay = 0) {
  const timeoutRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (endRef.current) endRef.current();
  }, []);

  return useCallback(async (fn) => {
    await new Promise((resolve) => {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        endRef.current = startGlobalLoading();
        resolve();
      }, delay);
      // If delay is 0 still schedule to unify logic
      if (delay === 0) {
        // microtask
        Promise.resolve().then(() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            endRef.current = startGlobalLoading();
            resolve();
          }
        });
      }
    });
    try {
      return await fn();
    } finally {
      if (endRef.current) {
        endRef.current();
        endRef.current = null;
      }
    }
  }, [delay]);
}
