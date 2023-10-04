import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GMCheckItem, ParaphraseItem, VocabularyItem } from '~types';

type saveData = {
  vocabulary: Vocabulary[];
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

const initialState: Record<url, saveData> = {};

const saveDataSlice = createSlice({
  name: 'saveData',
  initialState,
  reducers: {
    saveVocabulary: (state, action: PayloadAction<SavVocabularyPayload>) => {
      const { url, data } = action.payload;
      if (!url || !data) {
        console.error('redux[saveVocabulary]: url or data is empty');
        return
      }

      if (!state[url]) {
        state[url] = { vocabulary: [], paraphrases: [], grammarMistakes: [] };
      }
      state[url].vocabulary.push({ data, archived: false });
    },
    saveParaphrases: (state, action: PayloadAction<SaveParaphrasePayload>) => {
      const { url, data } = action.payload;
      if (!state[url]) {
        state[url] = { vocabulary: [], paraphrases: [], grammarMistakes: [] };
      }
      state[url].paraphrases.push({ data, archived: false });
    },
    saveGrammarMistakes: (state, action: PayloadAction<SaveGrammarMistakesPayload>) => {
      const { url, data } = action.payload;
      if (!state[url]) {
        state[url] = { vocabulary: [], paraphrases: [], grammarMistakes: [] };
      }
      state[url].grammarMistakes.push({ data, archived: false });
    },
    toggleArchive: (state, action: PayloadAction<{ url: string; type: 'vocabulary' | 'paraphrases' | 'grammarMistakes'; index: number }>) => {
      const { url, type, index } = action.payload;
      if (state[url]) {
        state[url][type][index].archived = !state[url][type][index].archived;
      }
    },
  },
});

export const { saveVocabulary, saveParaphrases, saveGrammarMistakes, toggleArchive } = saveDataSlice.actions;

export default saveDataSlice.reducer;