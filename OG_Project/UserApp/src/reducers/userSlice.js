import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_URLS } from "../apiUrls";

const initialState = {
  status: false,
  user: null,
  userDetails: {
    _id: "",
    username: "",
    full_name: "",
    email: "",
    phone_no: "",
    profile_photo: "",
    gender: "",
    role: "",
  },
  transactions: {},
  auditors: [],
  sharedWith: [], // Array of auditor IDs shared by the logged-in user
  transactionId: "",
  loading: false,
  error: null,
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

// Async thunk for fetching sharedWith and transaction ID
export const fetchUserSharedTransactions = createAsyncThunk(
  "user/fetchUserSharedTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        API_URLS.GET_USER_TRANSACTIONS,
        addAuthTokenHeader()
      );
      return response.data; // This should return sharedWith and transactionId
    } catch (error) {
      toast.error("Failed to fetch shared transactions");
      return rejectWithValue(
        error.response?.data || "Error fetching shared transactions"
      );
    }
  }
);

// Thunk to get all auditors
export const getAuditors = createAsyncThunk(
  "user/getAuditors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        API_URLS.GET_AUDITORS,
        addAuthTokenHeader()
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to retrieve auditors");
      return rejectWithValue(error.response?.data || "Error retrieving auditors");
    }
  }
);

// Async thunk for adding a new transaction
export const addTransaction = createAsyncThunk(
  "user/addTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        API_URLS.ADD_TRANSACTION,
        transactionData,
        addAuthTokenHeader()
      );
      toast.success("Transaction added successfully!");
      return response.data;
    } catch (error) {
      toast.error("Failed to add transaction");
      return rejectWithValue(
        error.response?.data || "Error adding transaction"
      );
    }
  }
);

// Async thunk for fetching transactions
export const fetchTransactions = createAsyncThunk(
  "user/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        API_URLS.GET_TRANSACTIONS,
        addAuthTokenHeader()
      );
      // console.log(response.data);
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch transactions");
      return rejectWithValue(
        error.response?.data || "Error fetching transactions"
      );
    }
  }
);

// Async thunk for updating a transaction
export const updateTransaction = createAsyncThunk(
  "user/updateTransaction",
  async ({ transactionId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        API_URLS.UPDATE_TRANSACTION(transactionId),
        updatedData,
        addAuthTokenHeader()
      );
      toast.success("Transaction updated successfully!");
      return response.data;
    } catch (error) {
      toast.error("Failed to update transaction");
      return rejectWithValue(
        error.response?.data || "Error updating transaction"
      );
    }
  }
);

// Async thunk for deleting a transaction
export const deleteTransaction = createAsyncThunk(
  "user/deleteTransaction",
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        API_URLS.DELETE_TRANSACTION(transactionId),
        addAuthTokenHeader()
      );
      toast.success("Transaction deleted successfully!");
      return { transactionId };
    } catch (error) {
      toast.error("Failed to delete transaction");
      return rejectWithValue(
        error.response?.data || "Error deleting transaction"
      );
    }
  }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        API_URLS.GET_USER_PROFILE,
        addAuthTokenHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching user profile"
      );
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        API_URLS.UPDATE_USER_PROFILE,
        profileData,
        addAuthTokenHeader()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating user profile"
      );
    }
  }
);

// Async thunk for sharing transactions with an auditor
export const shareTransaction = createAsyncThunk(
  "user/shareTransaction",
  async ({ auditorId, transactionId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        API_URLS.SHARE_TRANSACTION,
        { auditor_id: auditorId, transaction_id: transactionId },
        addAuthTokenHeader()
      );
      toast.success("Transactions shared successfully!");
      return auditorId; // Return the auditor ID
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to share transactions");
      return rejectWithValue(
        error.response?.data || "Error sharing transactions"
      );
    }
  }
);

// Async thunk for revoking access to shared transactions
export const revokeAccess = createAsyncThunk(
  "user/revokeAccess",
  async ({ auditorId, transactionId }, { dispatch, rejectWithValue }) => { // Added transactionId to the params
    try {
      const response = await axios.post(
        API_URLS.REVOKE_ACCESS,
        { auditor_id: auditorId, transaction_id: transactionId },  // Include transactionId in the request
        addAuthTokenHeader()
      );
      toast.success("Access revoked successfully!");

      return auditorId; // Return the auditor ID
    } catch (error) {
      toast.error("Failed to revoke access");
      return rejectWithValue(error.response?.data || "Error revoking access");
    }
  }
);


// The user slice
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
      state.userDetails = {
        _id: "",
        username: "",
        full_name: "",
        email: "",
        phone_no: "",
        profile_photo: "",
        gender: "",
        role: "",
      };
      state.transactions = {}; // Changed to an empty object
      state.sharedWith = []; // Changed to an empty array
      state.transactionId = "";
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUserTransactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload || {}; // Update transactions
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle addTransaction
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions[action.payload._id] = action.payload;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle deleteTransaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        delete state.transactions[action.payload.transactionId];
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle updateTransaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.transactions[action.payload._id] = action.payload;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle fetchUserProfile
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
      })
      // Handle updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userDetails = { ...state.userDetails, ...action.payload };
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Handle getAuditors
      .addCase(getAuditors.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAuditors.fulfilled, (state, action) => {
        state.loading = false;
        state.auditors = action.payload; // Save auditors in state
      })
      .addCase(getAuditors.rejected, (state) => {
        state.loading = false;
      })
      // Handle shareTransaction
      .addCase(shareTransaction.fulfilled, (state, action) => {
        const auditorId = action.payload;
        if (!state.sharedWith.includes(auditorId)) {
          state.sharedWith.push(auditorId); // Add auditorId to sharedWith array
        }
      })
      .addCase(shareTransaction.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle revokeAccess
      .addCase(revokeAccess.fulfilled, (state, action) => {
        const auditorId = action.payload;
        state.sharedWith = state.sharedWith.filter((id) => id !== auditorId); // Remove auditorId from sharedWith array
      })
      .addCase(revokeAccess.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchUserSharedTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSharedTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.sharedWith = action.payload.sharedWith; // Update sharedWith
        state.transactionId = action.payload.transactionId; // Update transaction ID
      })
      .addCase(fetchUserSharedTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
