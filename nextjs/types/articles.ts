import { User } from './user';

interface Sumamry {
  level: string;
  content: string;
}

interface Vocabulary {
  level: string;
  word: string;
  meanings: string[];
  pronunciation: string;
}

interface Source {
  id: number;
  name: string;
  url: string;
  type: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary: Sumamry[];
  vocabulary: Vocabulary[];
  url: string;
  source: Source;
  createdAt: Date;
}

export interface Headline {
  id: number;
  title: string;
  url: string;
  source: Source;
  createdAt: Date;
}
