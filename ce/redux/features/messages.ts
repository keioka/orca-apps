import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoadingStatus } from '../types';

const NAME = 'message'

interface Message {
  text: string;
  role: string;
}

interface MessageLesson {
  [lessonId: string]: Message[];
}

interface MessageState {
  messageMap: MessageLesson;
  status: LoadingStatus;
  statusCreate: LoadingStatus;
  error: string | null;
  addingMessage: boolean;
}
const ROOT_URL = process.env.API_ROOT

const initialState: MessageState = { messageMap: {}, status: LoadingStatus.IDLE, statusCreate: LoadingStatus.IDLE, error: null, addingMessage: false };

export const fetchMessages = createAsyncThunk(`${NAME}/fetch`, async (lessonId: string, { getState, rejectWithValue }) => {
  try {
    const state = getState()

    if (!state.auth.session) {
      return rejectWithValue('fetchMessages: Session is not defined')
    }

    const token = state.auth.session.accessToken;
    const response = await axios.get(`${ROOT_URL}/api/lessons/${lessonId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log({ messages: response.data });
    return { [lessonId]: response.data };
  } catch (error) {
    console.error(error)
    rejectWithValue('Failed to fetch lesson')
  }
});


export const createMessage = createAsyncThunk(`${NAME}/create`, async ({
  message,
  lessonId
}: {
  lessonId: string,
  message: string
}, { getState, rejectWithValue }) => {
  try {

    console.log("========= createMessage ================")
    const state = getState()

    if (!state.auth.session) {
      return rejectWithValue('fetchMessages: Session is not defined')
    }

    const token = state.auth.session.accessToken;

    if (!token) {
      rejectWithValue('No session found')
    }

    const response = await axios.post(`${ROOT_URL}/api/lessons/${lessonId}/messages`,
      {
        message,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log({ messages: response.data });
    return { [lessonId]: [...state.messages.messageMap[lessonId], response.data] };
  } catch (error) {
    console.error(error)
    rejectWithValue(error.response.data.message)
  }
});

export const addMessage = createAsyncThunk(`${NAME}/add`, async (body: { message: string, lessonId: string }, { getState, rejectWithValue }) => {
  try {
    console.log("========= addMessage ================")
    const state = getState()

    if (!state.auth.session) {
      return rejectWithValue('fetchMessages: Session is not defined')
    }

    const token = state.auth.session.accessToken;

    if (!token) {
      rejectWithValue('No session found')
    }

    const response = await axios.post(
      `${AI_ROOT_URL}/api/chat`,
      body,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.status !== 200) {
      return rejectWithValue('Failed to create message')
    }

    const message = response.data.completion.choices[0].message

    return { message };
  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message
    return rejectWithValue(errorMessage)
  }
});

const messageSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = LoadingStatus.LOADING;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.status = LoadingStatus.SUCCESS;
        state.messageMap = {
          ...state.messages,
          ...action.payload
        };

      })
      .addCase(fetchMessages.rejected, (state, action: PayloadAction<string | null>) => {
        state.status = LoadingStatus.FAILED;
        state.error = action.error.message;
      })
      .addCase(addMessage.pending, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.LOADING;
        const lessonId = action.meta.arg.lessonId;

        state.messageMap = {
          ...state.messageMap,
          [lessonId]: [...state.messageMap[lessonId], { type: "user", fullContent: action.meta.arg.message }]
        }
        state.addingMessage = true
      })
      .addCase(addMessage.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.statusCreate = LoadingStatus.SUCCESS;
        const lessonId = action.meta.arg.lessonId;
        state.messageMap = {
          ...state.messageMap,
          [action.meta.arg.lessonId]: [...state.messageMap[lessonId], { type: "ai", fullContent: action.payload.message }]
        }
        state.addingMessage = false
      })
      .addCase(addMessage.rejected, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.FAILED;
        state.error = action.error.message;
        state.addingMessage = false
      })
      .addCase(createMessage.pending, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.LOADING;
      })
      .addCase(createMessage.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.statusCreate = LoadingStatus.SUCCESS;
        console.log({ action })
        state.messageMap = {
          ...state.messageMap,
          ...action.payload
        }
      })
      .addCase(createMessage.rejected, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.FAILED;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = messageSlice.actions;

export default messageSlice.reducer;