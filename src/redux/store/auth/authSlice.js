import {createSlice} from '@reduxjs/toolkit';
import {registerDeviceThunk} from './authAction';

const initialState = {
  loading: false,
  error: null,
  success: false,
  token: null,
  message: null,
  data: {},
  isDeviceRegistered: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // validate token process
    builder.addCase(registerDeviceThunk.pending, (state, {payload}) => {
      state.loading = true;
    });

    builder.addCase(registerDeviceThunk.fulfilled, (state, {payload}) => {
      state.success = true;
      state.loading = false;
      isDeviceRegistered = true;
    });

    builder.addCase(registerDeviceThunk.rejected, (state, {payload}) => {
      state.loading = false;
      state.error = payload;
    });
  },
});

export default authSlice.reducer;
export const {} = authSlice.actions;
