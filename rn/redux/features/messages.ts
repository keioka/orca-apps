import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { validateSessionAndToken } from '../../helpers/validate';

const NAME = 'message'

const ROOT_URL = process.env.EXPO_PUBLIC_API_ROOT

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
  translationMap: { [messageId: string]: string };
  status: LoadingStatus;
  isFetchingParaphrases: boolean;
  isFetchingTranslation: boolean;
  error: string | null;
  addingMessage: boolean;
}

const initialState: MessageState = { messageMap: {}, paraphraseMap: {}, translationMap: {}, isFetchingTranslation: false, error: null, addingMessage: false };


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

export const fetchTranslation = createAsyncThunk(
  `${NAME}/fetchTranslation`,
  async (
    { messageId, text }: { messageId: string, message: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState()

      if (!state.auth.session) {
        return rejectWithValue('fetchMessages: Session is not defined')
      }

      const token = state.auth.session.accessToken;
      const response = await axios.post(`${ROOT_URL}/api/translate`,
        {
          text,
          lang: "ja"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

      if (response.status !== 200) {
        console.error(response)
        return rejectWithValue('Failed to translate')
      }

      const { translation } = response.data
      return { translation, messageId };
    } catch (error) {
      console.error(error)
      rejectWithValue('Failed to translate')
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
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<{ lessonId: string; messages: Message[] }>) => {
        const { lessonId, messages } = action.payload;
        state.messageMap[lessonId] = messages;
        state.status = LoadingStatus.SUCCESS;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = LoadingStatus.FAILED;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(createAIMessage.pending, (state) => {
        state.addingMessage = true;
      })
      .addCase(createAIMessage.fulfilled, (state, action: PayloadAction<{ lessonId: string; message: Message }>) => {
        const { lessonId, message } = action.payload;
        state.messageMap[lessonId] = [...(state.messageMap[lessonId] || []), message];
        state.addingMessage = false;
      })
      .addCase(createAIMessage.rejected, (state, action) => {
        state.addingMessage = false;
        state.error = action.error.message || 'Failed to create AI message';
      })
      .addCase(addUserMessage.pending, (state) => {
        state.addingMessage = true;
      })
      .addCase(addUserMessage.fulfilled, (state, action: PayloadAction<{ lessonId: string; message: Message }>) => {
        const { lessonId, message } = action.payload;
        state.messageMap[lessonId] = [...(state.messageMap[lessonId] || []), message];
        state.addingMessage = false;
      })
      .addCase(addUserMessage.rejected, (state, action) => {
        state.addingMessage = false;
        state.error = action.error.message || 'Failed to add user message';
      })
      .addCase(fetchParaphrases.pending, (state) => {
        state.isFetchingParaphrases = true;
      })
      .addCase(fetchParaphrases.fulfilled, (state, action: PayloadAction<{ messageId: string; sentenceIndex: number; paraphrases: Paraphrase[] }>) => {
        const { messageId, sentenceIndex, paraphrases } = action.payload;
        const currentParaphrases = state.paraphraseMap[messageId] || {};
        currentParaphrases[sentenceIndex] = paraphrases;
        state.paraphraseMap[messageId] = currentParaphrases;
        state.isFetchingParaphrases = false;
      })
      .addCase(fetchParaphrases.rejected, (state, action) => {
        state.isFetchingParaphrases = false;
        state.error = action.error.message || 'Failed to fetch paraphrases';
      })
      .addCase(fetchTranslation.pending, (state) => {
        state.isFetchingTranslation = true;
      })
      .addCase(fetchTranslation.fulfilled, (state, action: PayloadAction<{ messageId: string; translation: string }>) => {
        const { messageId, translation } = action.payload;
        state.translationMap[messageId] = translation;
        state.isFetchingTranslation = false;
      })
      .addCase(fetchTranslation.rejected, (state, action) => {
        state.isFetchingTranslation = false;
        state.error = action.error.message || 'Failed to fetch translation';
      });
  },
});

export const { clearError } = messageSlice.actions;

export default messageSlice.reducer;