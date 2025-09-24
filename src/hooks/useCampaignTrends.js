import { useMemo } from 'react';

// Centralizes extraction + normalization of trend arrays for charts
export default function useCampaignTrends(quickStats){
  return useMemo(()=>{
    const trend = quickStats?.trend || {};
    const normalize = (arr) => Array.isArray(arr) ? arr : [];
    return {
      open: normalize(trend.openRates),
      click: normalize(trend.clickRates),
      unsub: normalize(trend.unsubRates),
      delivered: normalize(trend.deliveredCounts),
    };
  }, [quickStats]);
}