export interface Lesson { }

export interface Message {
  id: string,
  message: string,
  type: "ai" | "human"
}

export interface VocabularyItem {
  word: string;
  pronounce: string;
  meaning: string;
  sentence: string;
  transMeaningJaByContext: string;
  example: string;
}

export interface ParaphraseItem {
  paraphrase: string;
  originalSentence: string;
}

export interface GMCheckItem {
  text: string;
  type: null | string; // Assuming the type is either null or a string
  offset: number;
  length: number;
  suggestions: GMCheckSuggestion[];
}

export interface GMCheckSuggestion {
  suggestion: string;
  score: null | number; // Assuming the score is a number or null based on the example
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
  transMeaningJaByContext: string;
  example: string;
};

export type VocabularyEntry = {
  data: VocabularyData;
  archived: boolean;
};

export type Paraphrase = {
  data: ParaphraseItem;
  archived: boolean;
};

export type GrammarMistake = {
  data: GMCheckItem;
  archived: boolean;
};

export type Notes = {
  [key: string]: NoteData;
};

export interface Payment {
  id: string;
  amount: number;
  createdAt: number;
  currency: string;
  status: string;
  trialInfo: {
    start: number;
    end: number;
  }
}

export interface Summary {
  level: string;
  summary: string;
}