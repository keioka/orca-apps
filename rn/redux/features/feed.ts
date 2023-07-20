import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { feedItems } from '../../helpers/dummy'

interface FeedState {
  feed: any[];
  status: LoadingStatus;
  error: string | null;
}

const initialState: FeedState = { feed: feedItems, status: LoadingStatus.IDLE, error: null };

export const fetchFeed = createAsyncThunk('blog/fetchFeed', async () => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
  return response.data;
});

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.status = LoadingStatus.LOADING;
      })
      .addCase(fetchFeed.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.status = LoadingStatus.SUCCESS;
        state.posts = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action: PayloadAction<string | null>) => {
        state.status = LoadingStatus.FAILED;
        state.error = action.error.message;
      });
  },
});

export default feedSlice.reducer;