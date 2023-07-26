import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface TranscribeState {
  transcript: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TranscribeState = {
  transcript: '',
  status: 'idle',
  error: null,
};

export const transcribeAudio = createAsyncThunk(
  'transcribe/fetchTranscript',
  async (file: File, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('http://localhost:3000/transcribe', formData);

    if (response.status === 200) {
      return response.data;
    } else {
      rejectWithValue('Failed to transcribe audio');
    }
  }
);

const transcribeSlice = createSlice({
  name: 'transcribe',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(transcribeAudio.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(transcribeAudio.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.transcript = action.payload;
      })
      .addCase(transcribeAudio.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ? action.error.message : null;
      });
  },
});

export default transcribeSlice.reducer;