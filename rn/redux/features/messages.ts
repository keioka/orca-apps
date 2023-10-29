import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { validateSessionAndToken } from '../../helpers/validate';

const NAME = 'message'

const ROOT_URL = process.env.NODE_ENV === "development" ? "http://192.168.1.2:3000" : "https://orca-fullstack.vercel.app";

interface Message {
  text: string;
  role: string;
}

interface Paraphrase {
  content: string;

}

interface MessageLesson {
  [lessonId: string]: Message[];
}

interface ParaphraseMap {
  [messageId: string]: SentenceMap;
}

interface SentenceMap {
  [sentenceIndex: number]: Paraphrase[];
}

interface MessageState {
  messageMap: MessageLesson;
  paraphraseMap: ParaphraseMap;
  status: LoadingStatus;
  isFetchingParaphrases: boolean;
  error: string | null;
  addingMessage: boolean;
}

const initialState: MessageState = { messageMap: {}, paraphraseMap: {}, status: LoadingStatus.IDLE, statusCreate: LoadingStatus.IDLE, error: null, addingMessage: false };


export const fetchMessages = createAsyncThunk(`${NAME}/fetch`, async (lessonId: string, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = validateSessionAndToken(state);

    const response = await axios.get(`${ROOT_URL}/api/lessons/${lessonId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { messages: response.data, lessonId };
  } catch (error) {
    console.error(error)
    return rejectWithValue(error.message || 'Failed to fetch lesson');
  }
});


export const createAIMessage = createAsyncThunk(`${NAME}/create`, async ({
  message,
  lessonId
}: {
  lessonId: string,
  message: string
}, { getState, rejectWithValue }) => {
  try {

    const state = getState()
    const token = validateSessionAndToken(state);

    const response = await axios.post(`${ROOT_URL}/api/lessons/${lessonId}/chat`,
      {
        message,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const aiMessage = response.data
    return { message: aiMessage, lessonId };
  } catch (error) {
    console.error(error)
    rejectWithValue(error.response.data.message)
  }
});

export const addUserMessage = createAsyncThunk(`${NAME}/add`, async ({ lessonId, message }: { message: string, lessonId: string }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const token = validateSessionAndToken(state);

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
    const userMessage = response.data
    return { message: userMessage, lessonId };
  } catch (error) {
    console.error(error)
    rejectWithValue(error.response.data.message)
  }
});

export const fetchParaphrases = createAsyncThunk(`${NAME}/fetchParaphrases`, async ({ messageId, sentence, sentenceIndex }: { messageId: string }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const token = validateSessionAndToken(state);

    if (!messageId || !sentence || sentenceIndex == null) {
      return rejectWithValue('No messageId or sentence or sentenceIndex')
    }

    const response = await axios.post(
      `${ROOT_URL}/api/messages/${messageId}/paraphrase`,
      {
        sentence,
        sentenceIndex,
        messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.status !== 200) {
      return rejectWithValue('Failed to create message')
    }

    return { paraphrases: response.data.phrases, messageId, sentenceIndex };
  } catch (error) {
    console.error(error)
    const errorMessage = error.response.data.message
    return rejectWithValue(errorMessage)

  }
})

const messageSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {
    // addUserMessage: (state, action: PayloadAction<{ lessonId: string, message: string }>) => {
    //   const { lessonId, message } = action.payload
    //   const prevMessages = state.messageMap[lessonId] || []
    //   state.messageMap = {
    //     ...state.messageMap,
    //     [lessonId]: [...prevMessages, { type: "user", content: message, createdAt: new Date().toISOString() }]
    //   }
    // },
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
        const { lessonId, messages } = action.payload
        const messagesMap = messages.map((message: any) => {
          return {
            id: message.id,
            type: message.type,
            content: message.content,
            createdAt: message.createdAt
          }
        })
        console.log({ messagesMap })
        state.status = LoadingStatus.SUCCESS;
        state.messageMap = {
          ...state.messages,
          [lessonId]: messagesMap
        };

      })
      .addCase(fetchMessages.rejected, (state, action: PayloadAction<string | null>) => {
        state.status = LoadingStatus.FAILED;
        state.error = action.error.message;
      })
      .addCase(createAIMessage.pending, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.LOADING;
      })
      .addCase(createAIMessage.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.statusCreate = LoadingStatus.SUCCESS;
        const { message, lessonId } = action.payload
        const prevMessages = state.messageMap[lessonId] || []

        state.messageMap = {
          ...state.messageMap,
          [lessonId]: [...prevMessages, message]
        }
      })
      .addCase(createAIMessage.rejected, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.FAILED;
        state.error = action.error.message;
      })
      .addCase(addUserMessage.pending, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.LOADING;
      })
      .addCase(addUserMessage.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.statusCreate = LoadingStatus.SUCCESS;
        const { message, lessonId } = action.payload
        const prevMessages = state.messageMap[lessonId] || []

        state.messageMap = {
          ...state.messageMap,
          [lessonId]: [...prevMessages, message]
        }
      })
      .addCase(addUserMessage.rejected, (state, action: PayloadAction<string | null>) => {
        state.statusCreate = LoadingStatus.FAILED;
        state.error = action.error.message;
      })
      .addCase(fetchParaphrases.pending, (state, action: PayloadAction<string | null>) => {
        state.isFetchingParaphrases = true
      })
      .addCase(fetchParaphrases.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isFetchingParaphrases = false
        const { paraphrases, messageId, sentenceIndex } = action.payload
        const prevParaphrases = state.paraphraseMap[messageId] || {}
        const prevSentenceParaphrases = prevParaphrases[sentenceIndex] || []
        state.paraphraseMap = {
          ...state.paraphraseMap,
          [messageId]: {
            ...prevParaphrases,
            [sentenceIndex]: [...prevSentenceParaphrases, ...paraphrases]
          }
        }
      })
      .addCase(fetchParaphrases.rejected, (state, action: PayloadAction<string | null>) => {
        state.isFetchingParaphrases = false
        state.error = action.payload;
      });
  },
});

export const { clearError } = messageSlice.actions;

export default messageSlice.reducer;