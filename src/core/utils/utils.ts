export interface urlRequest {
  main: string;
  vocab: string;
  sprint: string;
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
      stats: '',
    };
    const [main, vocab, sprint, stats] = [r[1], r[2], r[3], r[4]];
    request.main = main;
    request.vocab = vocab;
    request.sprint = sprint;
    request.stats = stats;

    return request;
  },
};

export default Utils;
