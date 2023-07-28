import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the state shape
interface VideoInfoState {
  captions: { [key: string]: string } | null
  status: 'idle' | 'loading' | 'failed';
  error: null | string;
}

// Define the initial state
const initialState: VideoInfoState = {
  captions: {},
  status: 'idle',
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
      });
  },
});

export default videoInfoSlice.reducer;