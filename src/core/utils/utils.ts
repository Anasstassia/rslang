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
};

export default Utils;
