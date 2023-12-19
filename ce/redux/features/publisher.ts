import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { feedItems } from '../../helpers/dummy'
import { RootState } from '../store';
import { sendToBackground } from '@plasmohq/messaging';

interface PublisherState {
  publishers: any[];
  followIds: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PublisherState = { publishers: [], isLoading: false, error: null };

// export const fetchPublishers = createAsyncThunk('blog/fetchPublishers', async () => {
//   const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
//   return response.data;
// });


export const fetchPublishers = createAsyncThunk('publishers/fetch', async () => {
  const response = await sendToBackground({
    name: 'fetchPublishers',
  })

  console.log({ response })

  return response.data;
});




const feedSlice = createSlice({
  name: 'publisher',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPublishers.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isLoading = false;
        state.publishers = action.payload.publishers;
      })
      .addCase(fetchPublishers.rejected, (state, action: PayloadAction<string | null>) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default feedSlice.reducer;