import { useQueries, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import analyticsService from '../services/analyticsService';
import subscriberService from '../services/subscriberService';
import formService from '../services/formService';
import automationService from '../services/automationService';
import campaignService from '../services/campaignService';
import api from '../services/api';

export function useDashboardOverview(timeframe) {
  const { user } = useSelector(s => s.auth);
  const enabled = !!user && user.isVerified && user.isProfileComplete;
  return useQuery({
    queryKey: ['dashboard-overview', timeframe],
    queryFn: () => analyticsService.getDashboardOverview(timeframe),
    enabled,
  });
}

export function useAncillaryDashboardData(enableFlag = true) {
  const { user } = useSelector(s => s.auth);
  const enabled = enableFlag && !!user && user.isVerified && user.isProfileComplete;
  const results = useQueries({
    queries: [
      {
        queryKey: ['subscriber-stats'],
        enabled,
        queryFn: () => subscriberService.getSubscriberStats(),
      },
      {
        queryKey: ['form-stats'],
        enabled,
        queryFn: async () => {
          const forms = await formService.getForms();
          const list = forms.forms || [];
            const totalSubmissions = list.reduce((sum, f) => sum + (f.submissionCount || 0), 0);
            return { total: list.length, submissions: totalSubmissions };
        },
      },
      {
        queryKey: ['automation-stats'],
        enabled,
        queryFn: async () => {
          const automations = await automationService.getAutomations();
          const list = Array.isArray(automations) ? automations : (automations.automations || []);
          const statuses = list.reduce((acc, a) => { const s = (a.status || 'unknown').toLowerCase(); acc[s] = (acc[s] || 0) + 1; return acc; }, {});
          return { total: list.length, statuses };
        },
      },
      {
        queryKey: ['campaign-stats'],
        enabled,
        queryFn: async () => {
          const campaigns = await campaignService.getCampaigns();
          return { total: Array.isArray(campaigns) ? campaigns.length : (campaigns.campaigns?.length || 0) };
        },
      },
      {
        queryKey: ['site-stats'],
        enabled,
        queryFn: async () => {
          const landing = await api.get('/landing-pages');
          const pages = landing.data?.landingPages || [];
          const statuses = pages.reduce((acc, p) => { const s = (p.status || 'draft').toLowerCase(); acc[s] = (acc[s] || 0) + 1; return acc; }, {});
          return { total: pages.length, statuses };
        },
      }
    ]
  });

  return {
    subscriberStats: results[0].data,
    formStats: results[1].data,
    automationStats: results[2].data,
    campaignStats: results[3].data,
    siteStats: results[4].data,
    loading: results.some(r => r.isLoading),
    errors: results.filter(r => r.error).map(r => r.error),
  };
}
