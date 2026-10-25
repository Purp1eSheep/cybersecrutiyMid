export type QuestionType = 'single' | 'tf';

export interface Option {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  chapter?: string;
  source?: string;
  question: string;
  code?: string | null;
  options?: Option[];
  answer: string[];
  explanation?: string | null;
  fixedOptions?: string[];
}

export interface BankMeta {
  title: string;
  version: number;
  updated?: string;
}

export interface Bank {
  meta: BankMeta;
  questions: Question[];
}

export type Mode = 'sequential' | 'random' | 'wrong';

export type View = 'dashboard' | 'practice' | 'wrong' | 'stats' | 'settings';

export interface SessionConfig {
  mode: Mode;
  chapters: string[] | 'all';
  count: number | 'all';
  unattemptedOnly: boolean;
}

export interface Session extends SessionConfig {
  queue: string[];
  index: number;
  results: Record<string, boolean>;
  selections: Record<string, string[]>;
  optionOrders: Record<string, string[]>;
}

export interface QuestionStat {
  attempts: number;
  correct: number;
  wrongCount: number;
  consecutiveCorrect: number;
  inWrongBook: boolean;
  lastResult: boolean | null;
}

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  autoNext: boolean;
}

export interface StoredState {
  version: 1;
  stats: Record<string, QuestionStat>;
  activity: Record<string, number>;
  lastSession: Session | null;
  settings: Settings;
}
