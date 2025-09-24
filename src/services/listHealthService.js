import api from './api';

const listHealthService = {
  async getListHealth(days=30){
    const res = await api.get(`/list-health?days=${days}`);
    return res.data;
  }
};
export default listHealthService;
