export interface urlRequest {
  main: string;
  vocab: string;
}

export const Utils = {
  parseRequestURL: () => {
    const url: string = window.location.hash.slice(1).toLowerCase() || '/';

    const r: string[] = url.split('/');

    const request: urlRequest = {
      main: '',
      vocab: '',
    };
    const [main, vocab] = [r[1], r[2]];
    request.main = main;
    request.vocab = vocab;

    return request;
  },
};

export default Utils;
