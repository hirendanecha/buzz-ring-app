import {createAsyncThunk} from '@reduxjs/toolkit';
import scanAPI from '../../../services/api/scan';

export const validateTokenThunk = createAsyncThunk(
  'validateToken',
  async (data, {rejectWithValue}) => {
    try {
      const response = await scanAPI.validateToken(data);
      return response;
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  'deleteUser',
  async (data, {rejectWithValue}) => {
    try {
      const response = await scanAPI.deleteScannedUser(data);
      return response;
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  },
);
