import axios from 'axios';

export const serverUrl = 'http://localhost:8000';

const adminApi = axios.create({
  baseURL: serverUrl,
  withCredentials: true
});

export default adminApi;
