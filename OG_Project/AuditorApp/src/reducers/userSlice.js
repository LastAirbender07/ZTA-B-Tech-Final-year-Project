import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URLS } from "../apiUrls";
import { toast } from "react-hot-toast";
import axios from "axios";

// Initial state
const initialState = {
  status: false,
  user: null,
  loading: false,
  auditInfo: null,
  sharedUsers: null,
};

// Helper function to add JWT to request headers
const addAuthTokenHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Thunk to update auditor details
export const updateAuditorDetails = createAsyncThunk(
  "user/updateAuditorDetails",
  async (details, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URLS.UPDATE_AUDITOR_DETAILS, details, addAuthTokenHeader());
      toast.success("Auditor details updated successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to update auditor details");
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk to get auditor info and shared users
export const getAuditorInfo = createAsyncThunk(
  "user/getAuditorInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URLS.GET_AUDITOR_INFO, addAuthTokenHeader());
      return response.data;
    } catch (error) {
      toast.error("Failed to retrieve auditor info");
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.status = true;
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.status = false;
      state.user = null;
      state.auditInfo = null;
      state.sharedUsers = null;
    },
  },
  extraReducers: (builder) => {
    // Handle updateAuditorDetails
    builder
      .addCase(updateAuditorDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAuditorDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateAuditorDetails.rejected, (state) => {
        state.loading = false;
      });

    // Handle getAuditorInfo
    builder
      .addCase(getAuditorInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAuditorInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.auditInfo = action.payload.auditInfo;
        state.sharedUsers = action.payload.sharedUsers;
      })
      .addCase(getAuditorInfo.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
