/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import { refreshToken } from './users';

const instance = axios.create({
  baseURL: 'https://rs-lang-irina-mokh.herokuapp.com/',
  timeout: 5000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async (config) => {
    const value = localStorage.getItem('token');

    if (value) {
      Object.assign(config.headers, {
        Authorization: `Bearer ${value}`,
      });
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    const {
      data: { token, refreshToken: rtoken },
    } = response;
    if (token) {
      localStorage.setItem('token', token);
    }
    if (rtoken) {
      localStorage.setItem('refreshToken', rtoken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.response.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshToken();
      return instance(originalRequest);
    }
    return Promise.reject(error);
  }
);

export { instance as client };
