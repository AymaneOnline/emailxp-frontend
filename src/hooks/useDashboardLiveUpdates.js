import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { isOnboardingComplete } from '../utils/onboarding';
import { getBackendUrl } from '../utils/getBackendUrl';

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

    // Fetch SSE token first
    const fetchTokenAndConnect = async () => {
      try {
        const base = (getBackendUrl() || '').replace(/\/$/, '');
        const tokenRes = await fetch(`${base}/api/stream/token`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!tokenRes.ok) throw new Error('Failed to get SSE token');
        const { token: sseToken } = await tokenRes.json();

        const url = `${base}/api/stream?token=${encodeURIComponent(sseToken)}`;
        const es = new EventSource(url);
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

      } catch (error) {
        console.error('Failed to connect to SSE:', error);
      }
    };

    fetchTokenAndConnect();

    return ()=>{
      if(sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
  }, [enabled, user, queryClient]);
}
