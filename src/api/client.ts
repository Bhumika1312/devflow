import axios from 'axios';

const client = axios.create({
  baseURL: 'https://devflow-backend-08eh.onrender.com/api',
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

export default client;