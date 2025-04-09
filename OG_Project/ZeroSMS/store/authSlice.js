import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  token: null,
  user: null,
  backendURL: '',
  loading: false,
  error: null,
  userDetails: {},
};

const addAuthTokenHeader = (token) => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };
  
  export const fetchUserProfile = createAsyncThunk(
    "user/fetchUserProfile",
    async (_, { getState, rejectWithValue }) => {
      const { token, backendURL } = getState().auth;  // Get token and backendURL from state
      try {
        const response = await axios.get(`http://${backendURL}/user/profile`, addAuthTokenHeader(token));
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Error fetching user profile");
      }
    }
  );

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.backendURL = action.payload.backendURL; // Store backend URL
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.backendURL = ''; // Clear backend URL on logout
      state.userDetails = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.userDetails = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
