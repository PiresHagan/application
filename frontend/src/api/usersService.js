import api from './index';

const usersService = {
  login: (email, password) => api.post('/api/users/login', { email, password })
};

export default usersService;
