export interface content {
  render: () => Promise<string>;
  run: () => void;
}

export interface iWord {
  _id: string;
  group: number;
  page: number;
  word: string;
  image: string;
  audio: string;
  audioMeaning: string;
  audioExample: string;
  textMeaning: string;
  textExample: string;
  transcription: string;
  wordTranslate: string;
  textMeaningTranslate: string;
  textExampleTranslate: string;
}

export interface iUserWord extends iWord {
  userWord?: {
    difficulty: string;
    optional: {
      done: boolean;
    };
  };
  wordId?: string;
}

export interface iUserWordCreator {
  userId: string | undefined;
  wordId: string;
  word: {
    difficulty: string;
    optional: { done: boolean };
  };
}
