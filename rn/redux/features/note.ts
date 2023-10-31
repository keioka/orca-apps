import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GMCheckItem, ParaphraseItem, VocabularyItem } from '~types';
import { validateSessionAndToken } from '../../helpers/validate';
import axios from 'axios';
import { uniqBy } from 'lodash';

type noteData = {
  vocabularies: Vocabulary[];
  paraphrases: Paraphrase[];
  grammarMistakes: GrammarMistake[];
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
};

const noteDataSlice = createSlice({
  name: 'note',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(saveVocab.pending, (state) => {
        state.savingVocab = true;
        state.error = null;
      })
      .addCase(saveVocab.fulfilled, (state, action) => {
        state.vocabularies = [...state.vocabularies, action.payload];
        state.savingVocab = false;
        state.error = null;
      })
      .addCase(saveVocab.rejected, (state, action) => {
        state.savingVocab = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSavedVocab.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedVocab.fulfilled, (state, action) => {
        state.vocabularies = uniqBy([...state.vocabularies, ...action.payload], "id")
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSavedVocab.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveParaphrase.pending, (state) => {
        state.savingParaphrase = true;
        state.error = null;
      })
      .addCase(saveParaphrase.fulfilled, (state, action) => {
        state.paraphrases = [...state.paraphrases, action.payload.savedPhraseInfo];
        state.savingParaphrase = false;
        state.error = null;
      })
      .addCase(saveParaphrase.rejected, (state, action) => {
        state.savingParaphrase = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSavedParaphrases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedParaphrases.fulfilled, (state, action) => {
        state.paraphrases = uniqBy([...state.paraphrases, ...action.payload.savedParaphrases], "id")
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSavedParaphrases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { saveParaphrases, saveGrammarMistakes, toggleArchive } = noteDataSlice.actions;

const ROOT_URL = process.env.EXPO_PUBLIC_API_ROOT

export const saveVocab = createAsyncThunk(`note/saveVocab`, async ({ vocabId }: { vocabId: string }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const token = validateSessionAndToken(state);

    const response = await axios.post(
      `${ROOT_URL}/api/vocabs/${vocabId}/save`,
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


export const saveParaphrase = createAsyncThunk(`note/saveParaphrase`, async ({ paraphraseId }: { paraphraseId: number }, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const token = validateSessionAndToken(state);

    console.log({ token })
    const response = await axios.post(
      `${ROOT_URL}/api/paraphrases/${paraphraseId}/save`,
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

export const fetchSavedVocab = createAsyncThunk(`note/fetchSavedVocab`, async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const token = validateSessionAndToken(state);

    const response = await axios.get(`${ROOT_URL}/api/vocabs/saved`, {
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
  { getState, rejectWithValue }
) => {
  try {
    const state = getState();
    const token = validateSessionAndToken(state);

    let baseUrl = `${ROOT_URL}/api/paraphrases/saved`;
    const queryParams: string[] = [];

    if (messageId) {
      queryParams.push(`messageId=${messageId}`);
    }
    if (sentenceIndex) {
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