import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { validateSessionAndToken } from '../../helpers/validate';

interface PublishersState {
  publishers: any[];
  followIds: string[];
  isLoadingPublishers: boolean;
  isCreatingFollow: boolean;
  isFetchingFollow: boolean;
  hasSuccessCreateFollow: boolean;
  error: string | null;
}

const initialState: PublishersState = { publishers: [], followIds: [], isLoadingPublishers: false, error: null, hasSuccessCreateFollow: false };

const ROOT_URL = process.env.EXPO_PUBLIC_API_ROOT

export const fetchPublishers = createAsyncThunk('publishers/fetch', async (_, { getState, rejectWithValue }) => {
  const state = getState()
  const token = validateSessionAndToken(state);

  try {
    const response = await axios.get(
      `${ROOT_URL}/api/publishers`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.publishers;
  } catch (error) {
    console.error(error)
    return rejectWithValue({ error: error.response.data.message })
  }
});

export const createFollowPublishers = createAsyncThunk('publishers/createFollow', async (publisherIds: string[], { getState, rejectWithValue }) => {
  const state = getState()
  const token = validateSessionAndToken(state);

  try {
    const response = await axios.post(
      `${ROOT_URL}/api/publishers/follow`,
      { publisherIds },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(error)
    return rejectWithValue({ error: error.response.data.message })
  }
})

export const fetchFollowPublishers = createAsyncThunk('publishers/fetchFollow', async (_, { getState, rejectWithValue }) => {
  const state = getState()
  const token = validateSessionAndToken(state);

  try {
    const response = await axios.get(
      `${ROOT_URL}/api/publishers/follow`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(error)
    return rejectWithValue({ error: error.response.data.message })
  }
})

const publisherSlice = createSlice({
  name: 'publisher',
  initialState,
  reducers: {
    clearHasSuccessCreateFollow: (state) => {
      state.hasSuccessCreateFollow = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishers.pending, (state) => {
        state.isLoadingPublishers = true
      })
      .addCase(fetchPublishers.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isLoadingPublishers = false
        state.publishers = action.payload;
      })
      .addCase(fetchPublishers.rejected, (state, action: PayloadAction<string | null>) => {
        state.isLoadingPublishers = false
        state.error = action.error.message;
      })
      .addCase(createFollowPublishers.pending, (state) => {
        state.isCreatingFollow = true
        state.hasSuccessCreateFollow = false
      })
      .addCase(createFollowPublishers.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isCreatingFollow = false
        state.followIds = action.payload.publisherIds;
        state.followCategories = action.payload.categories;
        state.hasSuccessCreateFollow = true
      })
      .addCase(createFollowPublishers.rejected, (state, action: PayloadAction<string | null>) => {
        state.isCreatingFollow = false
        state.error = action.error.message;
        state.hasSuccessCreateFollow = false
      })
      .addCase(fetchFollowPublishers.pending, (state) => {
        state.isFetchingFollow = true
      })
      .addCase(fetchFollowPublishers.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isFetchingFollow = false
        state.followIds = action.payload.publisherIds;
        state.followCategories = action.payload.categories;
      })
      .addCase(fetchFollowPublishers.rejected, (state, action: PayloadAction<string | null>) => {
        state.isFetchingFollow = false
        state.error = action.error.message;
      })

  },
});

export const { clearHasSuccessCreateFollow } = publisherSlice.actions

export default publisherSlice.reducer;