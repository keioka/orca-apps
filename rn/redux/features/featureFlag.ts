
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface FeatureFlagState {
  featureFlags: { [key: string]: boolean };
  isLoading: boolean;
  error: string | null;
}

const initialState: FeatureFlagState = {
  featureFlags: {},
  isLoading: false,
  error: null,
};

const ROOT_URL = process.env.EXPO_PUBLIC_API_ROOT

export const fetchFeatureFlag = createAsyncThunk(
  'featureFlag/fetchFeatureFlag',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios(`${ROOT_URL}/api/featureFlags`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
      }); // Replace with your API endpoint

      const { featureFlags } = response.data;
      return featureFlags;
    } catch (error) {
      const message = error.message;
      return rejectWithValue(message)
    }
  }
);

const featureFlagSlice = createSlice({
  name: 'featureFlag',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatureFlag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeatureFlag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureFlags = action.payload || {};
        state.error = null;
      })
      .addCase(fetchFeatureFlag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch feature flag.';
      });
  },
});

export const { setFeatureFlag } = featureFlagSlice.actions;
export default featureFlagSlice.reducer;
