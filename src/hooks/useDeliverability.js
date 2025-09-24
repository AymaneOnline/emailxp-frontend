import { useQuery } from '@tanstack/react-query';
import deliverabilityService from '../services/deliverabilityService';

export function useDeliverabilitySummary(days){
  return useQuery({ queryKey:['deliverability','summary',days], queryFn:()=>deliverabilityService.getSummary(days), staleTime:60_000 });
}

export function useDeliverabilityTrends(days){
  return useQuery({ queryKey:['deliverability','trends',days], queryFn:()=>deliverabilityService.getTrends(days), staleTime:60_000 });
}

export function useDeliverabilityInsights(days){
  return useQuery({ queryKey:['deliverability','insights',days], queryFn:()=>deliverabilityService.getInsights(days), staleTime:5*60_000 });
}
