import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { uniqBy } from 'lodash';

// Define the state shape
interface VideoInfoState {
  captions: { [key: string]: string } | null
  summaries: { [key: string]: string[] } | null
  status: 'idle' | 'loading' | 'failed';
  statusFetchSummaries: 'idle' | 'loading' | 'failed';
  error: null | string;
}

// Define the initial state
const initialState: VideoInfoState = {
  captions: {},
  summaries: {},
  status: 'idle',
  statusFetchSummaries: 'idle',
  error: null
};

// Define a type for the thunk action arguments
interface FetchCaptionsArgs {
  videoId: string;
}

const ROOT_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://orca-fullstack.vercel.app"  // process.env.EXPO_PUBLIC_API_ROOT

export const fetchCaptions = createAsyncThunk(
  'videoInfo/fetchCaptions',
  async ({ materialId }: FetchCaptionArgs, { rejectWithValue }) => {
    try {
      const caption = await axios.post(`${ROOT_URL}/api/youtube/captions`, {
        materialId
      })

      return caption.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.message)
    }
  }
);

export const fetchSummaries = createAsyncThunk(
  'videoInfo/fetchSummaries',
  async ({ materialId }: FetchCaptionArgs, { rejectWithValue }) => {
    try {
      const result = await axios.post(`${ROOT_URL}/api/youtube/summaries`, {
        materialId
      })

      return result.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.message)
    }
  }
);

export const fetchVocabs = createAsyncThunk(
  'videoInfo/fetchVocabs',
  async ({ materialId }: FetchCaptionArgs, { rejectWithValue }) => {
    try {
      const caption = await axios.post(`${ROOT_URL}/api/youtube/vocabs`, {
        materialId
      })

      return caption.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(error.message)
    }
  }
);

const videoInfoSlice = createSlice({
  name: 'videoInfo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaptions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCaptions.fulfilled, (state, action) => {
        state.status = 'idle';
        state.captions = {
          ...state.captions,
          ...action.payload
        };
      })
      .addCase(fetchCaptions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchSummaries.pending, (state) => {
        state.statusFetchSummaries = 'loading';
        state.error = null;
      })
      .addCase(fetchSummaries.fulfilled, (state, action) => {
        state.statusFetchSummaries = 'idle';
        const { materialId, ...summary } = action.payload
        const prev = state.summaries[materialId] || []
        state.summaries = {
          ...state.summaries,
          [materialId]: uniqBy([...prev, summary], 'materialId')
        };
      })
      .addCase(fetchSummaries.rejected, (state, action) => {
        state.statusFetchSummaries = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchVocabs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchVocabs.fulfilled, (state, action) => {
        state.status = 'idle';
        state.vocabs = {
          ...state.vocabs,
          ...action.payload
        };
      })
      .addCase(fetchVocabs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default videoInfoSlice.reducer;