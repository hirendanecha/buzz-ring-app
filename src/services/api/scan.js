import {axiosInterceptor} from '../index';
import axios from 'axios';

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

axios.interceptors.request.eject(axiosInterceptor);

const scanAPI = {
  // Validate token User api
  validateToken(data) {
    return axios.post(`/api/v1/customers/verify-token`, data, config);
  },

  deleteScannedUser(data) {
    return axios.delete(`/api/v1/customers/delete/${data.scanId}`, config);
  },
};

export default scanAPI;
