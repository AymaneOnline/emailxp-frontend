import { useQuery } from '@tanstack/react-query';
import funnelService from '../services/funnelService';

function deriveStageMetrics(stages){
  if(!Array.isArray(stages)) return [];
  const enriched = stages.map((stage, idx)=>{
    const prev = idx===0 ? null : stages[idx-1];
    const percentOfPrevious = prev && prev.value ? (stage.value != null ? stage.value / prev.value : null) : 1;
    return {
      ...stage,
      percentOfPrevious: percentOfPrevious != null ? Number((percentOfPrevious*100).toFixed(2)) : null,
      dropOff: percentOfPrevious != null && percentOfPrevious !== 1 ? Number(((1-percentOfPrevious)*100).toFixed(2)) : null
    };
  });
  // Add explicit conversionRate (uniqueClicks -> conversions) if both present
  const clicks = enriched.find(s=>s.key==='uniqueClicks');
  const conv = enriched.find(s=>s.key==='conversions');
  if(clicks && conv && clicks.value && conv.value != null){
    conv.conversionRate = Number(((conv.value / clicks.value)*100).toFixed(2));
  }
  return enriched;
}

export const useEngagementFunnel = (timeframe='30d') => {
  return useQuery({
    queryKey: ['analytics','funnel', timeframe],
    queryFn: () => funnelService.getEngagementFunnel(timeframe),
    staleTime: 60_000,
    select: data => ({ ...data, stages: deriveStageMetrics(data.stages) })
  });
};

export default useEngagementFunnel;
