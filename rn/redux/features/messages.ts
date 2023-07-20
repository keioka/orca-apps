import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { messages } from '../../helpers/dummy'

const NAME = 'message'

interface Message {
  text: string;
  role: string;
}

interface MessageLesson {
  [lessonId: string]: Message[];
}

interface MessageState {
  messages: any[];
  status: LoadingStatus;
  statusCreate: LoadingStatus;
  error: string | null;
}

const API_HOST = 'http://localhost:3000'

const initialState: MessageState = { messages: messages, status: LoadingStatus.IDLE, statusCreate: LoadingStatus.IDLE, error: null };

export const fetchMessages = createAsyncThunk(`${NAME}/fetchLessons`, async () => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
  return response.data;
});

export const addMessage = createAsyncThunk(`${NAME}/message`, async (body: { message: string, url: string, history: { message: string }[] }) => {
  const response = await axios.post(`${API_HOST}/api/bot`, body);
  return { message: response.data };
});

const messageSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = LoadingStatus.LOADING;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.status = LoadingStatus.SUCCESS;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action: PayloadAction<string | null>) => {
        state.status = LoadingStatus.FAILED;
        state.error = action.error.message;
      })
      .addCase(addMessage.pending, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.LOADING;
        state.messages = [...state.messages, { role: "user", message: action.meta.arg.message }];
      })
      .addCase(addMessage.fulfilled, (state, action: PayloadAction<any[]>) => {
        console.log({ action, state })
        state.statusCreate = LoadingStatus.SUCCESS;
        state.messages = [...state.messages, { role: "ai", message: action.payload.message }];
      })
      .addCase(addMessage.rejected, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.FAILED;
        state.error = action.error.message;
      });
  },
});

export default messageSlice.reducer;