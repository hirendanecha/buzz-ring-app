import {axiosInterceptor} from '../index';
import axios from 'axios';

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

axios.interceptors.request.eject(axiosInterceptor);

const authAPI = {
  // Login User api
  registerDevice(data) {
    // return fetch(`${env.API_URL}/api/auth/login`, data);
    // console.log(env.API_URL);
    return axios.post('/api/v1/customers/register-device', data, config);
  },
};

export default authAPI;
