import api from './api';

export const getEngagementFunnel = async (timeframe = '30d') => {
  const { data } = await api.get(`/analytics/funnel?timeframe=${encodeURIComponent(timeframe)}`);
  return data;
};

export default { getEngagementFunnel };
