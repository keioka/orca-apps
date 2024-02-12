import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoadingStatus } from '../types';
import { validateSessionAndToken } from '../helpers';

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
  creatingMessage: boolean;
  addingMessage: boolean;
  isFetchingParaphrases: boolean;
  isFetchingTranslation: boolean;
  isSendingWhisper: boolean;
  messageInputSpeech: string | null;
  error: string | null;
}

const initialState: MessageState = { messageMap: {}, paraphraseMap: {}, translationMap: {}, isFetchingTranslation: false, error: null, creatingMessage: false, addingMessage: false, messageInputSpeech: null };

const whisperApiEndpoint = 'https://api.openai.com/v1/audio/transcriptions'


export const fetchMessages = createAsyncThunk(`${NAME}/fetch`, async (lessonId: string, { getState, rejectWithValue, dispatch }) => {
  try {
    const state = getState();
    const token = await validateSessionAndToken(state, dispatch);

    const response = await axios.get(`/api/lessons/${lessonId}/messages`, {
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
}, { getState, rejectWithValue, dispatch }) => {
  try {

    const state = getState()
    const token = await validateSessionAndToken(state, dispatch);

    const response = await axios.post(`/api/lessons/${lessonId}/chat`,
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

export const addUserMessage = createAsyncThunk(`${NAME}/add`,
  async (
    { lessonId, message, type }: { message: string, lessonId: string },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await axios.post(`/api/lessons/${lessonId}/messages`,
        {
          message,
          type,
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

export const fetchParaphrases = createAsyncThunk(`${NAME}/fetchParaphrases`, async ({ messageId, sentence, sentenceIndex }: { messageId: string }, { getState, rejectWithValue, dispatch }) => {
  try {
    const state = getState()
    const token = await validateSessionAndToken(state, dispatch);

    if (!messageId || !sentence || sentenceIndex == null) {
      return rejectWithValue('No messageId or sentence or sentenceIndex')
    }

    const response = await axios.post(
      `/api/messages/${messageId}/paraphrase`,
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
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await axios.post(`/api/translate`,
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


function removeFilePrefix(filePath) {
  if (filePath.startsWith('file://')) {
    return filePath.substring(7);
  }
  return filePath;
}

export const sendWhisper = createAsyncThunk(
  `${NAME}/sendWhisper`,
  async (
    { file, fileURI }: { file: Blob, fileURI: string },
    { getState, rejectWithValue }
  ) => {
    try {

      console.log({ file, fileURI })
      const body = new FormData()
      const fileObj = {
        uri: removeFilePrefix(fileURI),
        name: `unknown`,
        type: "audio/wav" // file.type,
      }
      console.log("fileObj", fileObj)
      // body.append('file', file)
      body.append('file', new Blob(['test payload'], { type: 'text/csv' }));
      body.append('audio_data', file)
      body.append('type', 'audio')
      body.append('model', 'whisper-1')
      body.append('language', 'en')
      // body.append('prompt', whisperConfig.prompt)
      body.append('response_format', "text")
      // body.append('temperature', `${whisperConfig.temperature}`)

      // const headers: RawAxiosRequestHeaders = {
      //   'Content-Type': 'multipart/form-data',
      //   'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPEN_AI_API_KEY}`
      // }

      const response = await fetch(
        `/api/transcribe`,
        {
          method: 'POST',
          body,
        }
      )

      console.log(response)
      return response

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
        state.creatingMessage = true;
      })
      .addCase(createAIMessage.fulfilled, (state, action: PayloadAction<{ lessonId: string; message: Message }>) => {
        const { lessonId, message } = action.payload;
        state.messageMap[lessonId] = [...(state.messageMap[lessonId] || []), message];
        state.creatingMessage = false;
      })
      .addCase(createAIMessage.rejected, (state, action) => {
        state.creatingMessage = false;
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
      })
      .addCase(sendWhisper.pending, (state) => {
        state.isSendingWhisper = true;
      })
      .addCase(sendWhisper.fulfilled, (state, action: PayloadAction<{ messageId: string; translation: string }>) => {
        state.isSendingWhisper = false;
      })
      .addCase(sendWhisper.rejected, (state, action) => {
        state.isSendingWhisper = false;
        state.error = action.error.message || 'Failed to send whisper';
      })
      .addMatcher(
        (action) => action.type === "global/RESET_STATE",
        (state) => {
          state.messageMap = {}
          state.paraphraseMap = {}
          state.translationMap = {}
          state.status = LoadingStatus.IDLE
          state.addingMessage = false
          state.isFetchingParaphrases = false
          state.isFetchingTranslation = false
          state.isSendingWhisper = false
          state.messageInputSpeech = null
          state.error = null
        })
  },
});

export const { clearError } = messageSlice.actions;

export default messageSlice.reducer;