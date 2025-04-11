import api from './index';

// Export as default object with methods
const createService = {
  getDropdownValues: () => {
    return api.get('/api/dropdowns');
  },
  
  // Add the new saveOwners method
  saveOwners: (ownerData) => {
    return api.post('/api/owners', ownerData);
  }
};

export default createService;