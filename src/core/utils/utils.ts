export interface urlRequest {
  main: string;
  vocab: string;
  sprint: string;
}

export const Utils = {
  parseRequestURL: () => {
    const url: string = window.location.hash.slice(1).toLowerCase() || '/';

    const r: string[] = url.split('/');

    const request: urlRequest = {
      main: '',
      vocab: '',
      sprint: '',
    };
    const [main, vocab, sprint] = [r[1], r[2], r[3]];
    request.main = main;
    request.vocab = vocab;
    request.sprint = sprint;

    return request;
  },
};

export default Utils;
