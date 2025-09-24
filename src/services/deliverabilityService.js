import api from './api';

const deliverabilityService = {
  getSummary: async (days = 30) => {
    const res = await api.get(`/deliverability/summary?days=${days}`);
    return res.data; // expect { sent, delivered, hardBounces, softBounces, complaints, deferred, blocked }
  },
  getTrends: async (days = 14) => {
    const res = await api.get(`/deliverability/trends?days=${days}`);
    return res.data; // expect { buckets:[{ date, sent, delivered, hard, soft, complaints }] }
  },
  getInsights: async (days = 30) => {
    const res = await api.get(`/deliverability/insights?days=${days}`);
    return res.data; // heuristic insights list
  }
};

export default deliverabilityService;