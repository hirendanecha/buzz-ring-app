import {createAsyncThunk} from '@reduxjs/toolkit';
import authAPI from '../../../services/api/auth';

export const registerDeviceThunk = createAsyncThunk(
  'auth/registerDevice',
  async (data, {rejectWithValue}) => {
    try {
      const response = await authAPI.registerDevice(data);
      return response;
      // return response;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue(error.message);
      }
    }
  },
);
