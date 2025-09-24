import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { isOnboardingComplete } from '../utils/onboarding';

// Consumes /api/stream SSE and patches React Query caches
// Events:
//  - metric.snapshot { deliverability }
//  - funnel.delta { stages }
//  - stream.error { message }
export default function useDashboardLiveUpdates(enabled=true){
  const { user } = useSelector(s=>s.auth);
  const queryClient = useQueryClient();
  const sourceRef = useRef(null);

  useEffect(()=>{
  // Only connect when enabled, user exists, onboarding complete and email verified, and token present
  if(!enabled || !user || !isOnboardingComplete(user) || !user.isVerified || !user.token) return;
    // Avoid duplicate connections
    if(sourceRef.current) return;
    const url = `${process.env.REACT_APP_API_BASE || ''}/api/stream`;
    const es = new EventSource(url, { withCredentials: true });
    sourceRef.current = es;

    es.addEventListener('metric.snapshot', (e)=>{
      try {
        const payload = JSON.parse(e.data);
        if(payload.deliverability){
          // Update summary (assumes 30d key usage)
          queryClient.setQueryData(['deliverability','summary',30], (prev)=>{
            return { ...(prev||{}), ...payload.deliverability };
          });
        }
      } catch(err){ /* silent */ }
    });

    es.addEventListener('funnel.delta', (e)=>{
      try {
        const data = JSON.parse(e.data);
        if(Array.isArray(data.stages)){
          // Update funnel 30d query while preserving derived values (will be recalculated by selector on refetch if needed)
          queryClient.setQueryData(['analytics','funnel','30d'], (prev)=>{
            const base = prev || { timeframe:'30d' };
              // Lightweight recompute for conversionRate
              const stages = data.stages.slice();
              const clicks = stages.find(s=>s.key==='uniqueClicks');
              const conv = stages.find(s=>s.key==='conversions');
              if(clicks && conv && clicks.value && conv.value!=null){
                conv.conversionRate = Number(((conv.value / clicks.value)*100).toFixed(2));
              }
              return { ...base, stages };
          });
        }
      } catch(err){ /* ignore */ }
    });

    es.addEventListener('stream.error', (e)=>{
      // Could surface toast here; for now just console
      console.warn('SSE stream.error', e.data);
    });

    es.onerror = () => {
      // Browser auto-reconnects; if 429 or auth issue we can close
      // Leave default logic for simplicity
    };

    return ()=>{
      es.close();
      sourceRef.current = null;
    };
  }, [enabled, user, queryClient]);
}
