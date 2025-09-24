import { useQuery } from '@tanstack/react-query';
import listHealthService from '../services/listHealthService';

export function useListHealth(days=30){
  return useQuery({
    queryKey:['listHealth', days],
    queryFn: ()=> listHealthService.getListHealth(days),
    staleTime: 5*60_000
  });
}
export default useListHealth;
