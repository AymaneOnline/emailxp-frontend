import React, { useEffect, useRef, useState } from 'react';
import { useGlobalLoadingState } from '../../hooks/useGlobalLoading';

export default function LoadingOverlay({ delay = 200, message = 'Loading', fullscreen = true }) {
  const active = useGlobalLoadingState();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const [graceOff, setGraceOff] = useState(false);

  // Delay show to avoid flicker
  useEffect(() => {
    if (active) {
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          setVisible(true);
          timerRef.current = null;
        }, delay);
      }
    } else {
      // Add a short grace period to prevent flicker on rapid transitions
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (visible) {
        setGraceOff(true);
        const offTimer = setTimeout(() => {
          setVisible(false);
          setGraceOff(false);
        }, 120); // grace hide
        return () => clearTimeout(offTimer);
      }
    }
  }, [active, delay, visible]);

  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none ${fullscreen ? 'fixed inset-0' : 'absolute inset-0'} z-50 flex flex-col items-center justify-center bg-white/45 dark:bg-gray-900/55 backdrop-blur-sm transition-opacity duration-150 ${!active && graceOff ? 'opacity-0' : 'opacity-100'}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 border-4 border-primary-red/30 border-t-primary-red rounded-full animate-spin" />
        <span className="sr-only">{message}</span>
        <div className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">{message}</div>
      </div>
    </div>
  );
}
