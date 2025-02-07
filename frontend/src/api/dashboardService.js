import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Export as default object with methods
const dashboardService = {
  getDropdownValues: () => {
    return api.get('/api/dropdowns');
  }
};

export default dashboardService;