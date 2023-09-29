import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LanguageItem = {
  data: string;
  archived: boolean;
};

type saveData = {
  vocabulary: LanguageItem[];
  paraphrases: LanguageItem[];
  grammarMistakes: LanguageItem[];
};

type SaveDataPayload = {
  url: string;
  data: string;
};

const initialState: Record<string, saveData> = {};

const saveDataSlice = createSlice({
  name: 'saveData',
  initialState,
  reducers: {
    saveVocabulary: (state, action: PayloadAction<SaveDataPayload>) => {
      console.log({ action })
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
    saveParaphrases: (state, action: PayloadAction<SaveDataPayload>) => {
      const { url, data } = action.payload;
      if (!state[url]) {
        state[url] = { vocabulary: [], paraphrases: [], grammarMistakes: [] };
      }
      state[url].paraphrases.push({ data, archived: false });
    },
    saveGrammarMistakes: (state, action: PayloadAction<SaveDataPayload>) => {
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