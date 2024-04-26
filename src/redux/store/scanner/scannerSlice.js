import {createSlice} from '@reduxjs/toolkit';
import {deleteUserThunk, validateTokenThunk} from './scannerAction';

const initialState = {
  loading: false,
  error: null,
  success: false,
  token: null,
  message: null,
  data: [],
};

const scannerSlice = createSlice({
  name: 'scanner',
  initialState,
  reducers: {
    addScannerData: (state, action) => {
      console.log(action.payload);
      console.log(state);
      state.data.push(action.payload);
    },
    removeUser: (state, action) => {
      state.data = state.data.filter(item => item.Id !== action.payload);
    },
  },
  extraReducers: builder => {
    // validate token process
    builder.addCase(validateTokenThunk.pending, (state, {payload}) => {
      state.loading = true;
    });

    builder.addCase(validateTokenThunk.fulfilled, (state, {payload}) => {
      state.success = true;
      state.loading = false;
    });

    builder.addCase(validateTokenThunk.rejected, (state, {payload}) => {
      state.loading = false;
      state.error = payload;
    });

    // delete user process
    builder.addCase(deleteUserThunk.pending, (state, {payload}) => {
      state.loading = true;
    });

    builder.addCase(deleteUserThunk.fulfilled, (state, {payload}) => {
      state.success = true;
      state.loading = false;
    });

    builder.addCase(deleteUserThunk.rejected, (state, {payload}) => {
      state.loading = false;
      state.error = payload;
    });
  },
});

export default scannerSlice.reducer;
export const {addScannerData, removeUser} = scannerSlice.actions;
