import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GMCheckItem, ParaphraseItem, VocabularyItem } from '~types';
import { validateSessionAndToken } from '../helpers';
import axios from 'axios';
import { uniqBy } from 'lodash';

type noteData = {
  vocabularies: Vocabulary[];
  paraphrases: Paraphrase[];
  grammarMistakes: GrammarMistake[];
  isSavedVocab: boolean;
};

export type Vocabulary = {
  data: VocabularyItem;
  archived: boolean;
}

export type Paraphrase = {
  data: ParaphraseItem;
  archived: boolean;
}

export type GrammarMistake = {
  data: GMCheckItem;
  archived: boolean;
}

type SaveDataPayload = {
  url: string;
  data: string;
};

type SavVocabularyPayload = {
  url: string;
  data: VocabularyItem
};

type SaveGrammarMistakesPayload = {
  url: string;
  data: GMCheckItem
  originalSentence: string;
};


type SaveParaphrasePayload = {
  url: string;
  data: ParaphraseItem
};

type url = string;

const initialState: noteData = {
  vocabularies: [],
  paraphrases: [],
  grammarMistakes: [],
  isSavedVocab: false,
  isSavedParaphrase: false,
  errors: {
    saveVocabulary: null,
    saveParaphrase: null,
    saveGrammarMistakes: null,
  }
};

const noteDataSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    clearIsSavedVocab: (state) => {
      state.isSavedVocab = false;
    },
    clearErrorSaveVocab: (state) => {
      state.errors.saveVocab = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveVocab.pending, (state) => {
        state.savingVocab = true;
        state.errors.saveVocabulary = null;
        state.isSavedVocab = false;
      })
      .addCase(saveVocab.fulfilled, (state, action) => {
        state.vocabularies = [...state.vocabularies, action.payload];
        state.savingVocab = false;
        state.errors.saveVocabulary = null;
        state.isSavedVocab = true;
      })
      .addCase(saveVocab.rejected, (state, action) => {
        state.savingVocab = false;
        state.errors.saveVocabulary = action.payload || "Failed to save vocabulary"
        state.isSavedVocab = false;
      })
      .addCase(fetchSavedVocab.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedVocab.fulfilled, (state, action) => {
        state.vocabularies = uniqBy([...state.vocabularies, ...action.payload], "id")
        state.loading = false;
      })
      .addCase(fetchSavedVocab.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(saveParaphrase.pending, (state) => {
        state.savingParaphrase = true;
      })
      .addCase(saveParaphrase.fulfilled, (state, action) => {
        state.paraphrases = [...state.paraphrases, action.payload.savedPhraseInfo];
        state.savingParaphrase = false;
      })
      .addCase(saveParaphrase.rejected, (state, action) => {
        state.savingParaphrase = false;
      })
      .addCase(fetchSavedParaphrases.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSavedParaphrases.fulfilled, (state, action) => {
        state.paraphrases = uniqBy([...state.paraphrases, ...action.payload.savedParaphrases], "id")
        state.loading = false;
      })
      .addCase(fetchSavedParaphrases.rejected, (state, action) => {
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type === "global/RESET_STATE",
        (state) => {
          state.vocabularies = []
          state.paraphrases = []
          state.grammarMistakes = []
          state.isSavedVocab = false
          state.isSavedParaphrase = false
          state.errors = {
            saveVocabulary: null,
            saveParaphrase: null,
            saveGrammarMistakes: null,
          }
        })
  },
});

export const { saveParaphrases, saveGrammarMistakes, toggleArchive, clearIsSavedVocab, clearErrorSaveVocab } = noteDataSlice.actions;

const ROOT_URL = process.env.EXPO_PUBLIC_API_ROOT

export const saveVocab = createAsyncThunk(
  `note/saveVocab`,
  async ({ vocabId }: { vocabId: string }, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await axios.post(
        `/api/vocabs/${vocabId}/save`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status !== 200) {
        return rejectWithValue('Failed to create message')
      }

      const saveInfo = response.data

      return saveInfo;
    } catch (error) {
      console.error(error)
      const errorMessage = error.response.data.message
      return rejectWithValue(errorMessage)
    }
  });


export const saveParaphrase = createAsyncThunk(`note/saveParaphrase`,
  async ({ paraphraseId }: { paraphraseId: number }, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await axios.post(
        `/api/paraphrases/${paraphraseId}/save`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status !== 200) {
        return rejectWithValue('Failed to create message')
      }

      const { savedPhraseInfo } = response.data

      return { savedPhraseInfo };
    } catch (error) {
      console.error(error)
      const errorMessage = error.response.data.message
      return rejectWithValue(errorMessage)
    }
  });

export const fetchSavedVocab = createAsyncThunk(`note/fetchSavedVocab`,
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState()
      const token = await validateSessionAndToken(state, dispatch);

      const response = await axios.get(`/api/vocabs/saved`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.vocabs
    } catch (error) {
      console.error(error)
      const errorMessage = error.response.data.message
      return rejectWithValue(errorMessage)
    }
  })

export const fetchSavedParaphrases = createAsyncThunk(`note/fetchSavedParaphrases`, async (
  { messageId, sentenceIndex }: { messageId?: string; sentenceIndex?: string },
  { getState, rejectWithValue, dispatch }
) => {
  try {
    const state = getState();
    const token = await validateSessionAndToken(state, dispatch);

    let baseUrl = `/api/paraphrases/saved`;
    const queryParams: string[] = [];
    console.log({ messageId, sentenceIndex })

    if (messageId) {
      queryParams.push(`messageId=${messageId}`);
    }
    if (sentenceIndex !== undefined) {
      queryParams.push(`sentenceIndex=${sentenceIndex}`);
    }

    const url = queryParams.length ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const savedParaphrases = response.data.paraphrases;
    return { savedParaphrases };
  } catch (error) {
    console.error(error);
    const errorMessage = error.response && error.response.data ? error.response.data.message : "An error occurred";
    return rejectWithValue(errorMessage);
  }
});


export default noteDataSlice.reducer;