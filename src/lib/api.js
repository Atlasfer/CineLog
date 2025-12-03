// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ganti ke domain produksi nanti
  withCredentials: true, // PENTING! untuk kirim cookie JWT
});

// Optional: tambah interceptor untuk handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      // window.location.href = '/'; // redirect ke home
    }
    return Promise.reject(error);
  }
);

export default api;