import axios from 'axios';

const API_URL = '/api/audience';

const estimate = async (payload) => {
  const resp = await axios.post(`${API_URL}/estimate`, payload);
  return resp.data;
};

const sample = async (payload) => {
  const resp = await axios.post(`${API_URL}/sample`, payload);
  return resp.data;
};

const audienceService = { estimate, sample };
export default audienceService;
