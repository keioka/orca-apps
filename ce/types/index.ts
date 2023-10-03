export interface ParaphraseItem {
  sentence: string;
  // Add other properties if required.
}

export interface GMCheckItem {
  text: string;
  suggestions: GMCheckSuggestion[];
  // Add other properties if required.
}

export interface GMCheckSuggestion {
  suggestion: string;
  // Add other properties if required.
}

export type NoteData = {
  vocabulary: VocabularyEntry[];
  paraphrases: Paraphrase[];
  grammarMistakes: GrammarMistake[];
};

export type VocabularyData = {
  word: string;
  pronounce: string;
  meaning: string;
  sentence: string;
  transJaByContext: string;
  example: string;
};

export type VocabularyEntry = {
  data: VocabularyData;
  archived: boolean;
};

export type Paraphrase = {
  data: {
    sentence: string;
  };
  archived: boolean;
};

export type Suggestion = {
  suggestion: string;
  score: null; // If score can have different types in the future, replace 'null' with the possible export types
};

export type GrammarMistakeData = {
  suggestions: Suggestion[];
  sentence: string;
};

export type GrammarMistake = {
  data: GrammarMistakeData;
  archived: boolean;
};

export type Notes = {
  [key: string]: NoteData;
};