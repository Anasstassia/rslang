import { iUserWordResponse } from '../components/types';
import { getUserWords, state } from '../client/users';
import { stats } from '../../index';
import { client } from '../client';

export interface urlRequest {
  main: string;
  vocab: string;
  sprint: string;
  audio: string;
  stats: string;
}

export const Utils = {
  parseRequestURL: () => {
    const url: string = window.location.hash.slice(1).toLowerCase() || '/';

    const r: string[] = url.split('/');

    const request: urlRequest = {
      main: '',
      vocab: '',
      sprint: '',
      audio: '',
      stats: '',
    };
    const [main, vocab, sprint, audio, stats] = [r[1], r[2], r[3], r[4], r[5]];
    request.main = main;
    request.vocab = vocab;
    request.sprint = sprint;
    request.audio = audio;
    request.stats = stats;

    return request;
  },

  resetData: async () => {
    stats.learnedPages = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };
    stats.learnedWords = 0;
    const response = await getUserWords(String(state.currentUser?.id));
    const words = response.data;

    words.forEach(async (word: iUserWordResponse) => {
      await client.delete(`/users/${state.currentUser?.id}/words/${word.wordId}`);
    });
  },
};

export default Utils;
