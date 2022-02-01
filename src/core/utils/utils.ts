export interface urlRequest {
  main: string;
  vocab: string;
}

export const Utils = {
  parseRequestURL: () => {
    const url: string = location.hash.slice(1).toLowerCase() || '/';

    const r: string[] = url.split('/');

    const request: urlRequest = {
      main: '',
      vocab: '',
    };

    request.main = r[1];
    request.vocab = r[2];

    return request;
  },
};

export default Utils;
