import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URLS } from "../apiUrls";
import axios from "axios";

const initialState = {
  status: false,
  user: null,
  pendingUsers: [],
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
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPendingUsers.fulfilled, (state, action) => {
      state.pendingUsers = action.payload;
    });
  },
});

export const fetchPendingUsers = createAsyncThunk(
  "user/fetchPendingUsers",
  async () => {
    const response = await axios.get(API_URLS.PENDING_USERS, addAuthTokenHeader());
    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async ({ userId, role }) => {
    const response = await axios.post(
      API_URLS.UPDATE_ROLE,
      { user_id: userId, role },
      addAuthTokenHeader()
    );
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async ({ userId }) => {
    const response = await axios.post(
      API_URLS.DELETE_USER,
      { user_id: userId },
      addAuthTokenHeader()
    );
    return response.data;
  }
);

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
