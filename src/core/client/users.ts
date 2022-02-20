// import { isToday } from 'date-fns';
import { client } from '.';
import { renderAuthElements, stats } from '../..';
import { iUserWordCreator } from '../components/types';

export const state = {} as State;
const numberOfCorrectAnswersToGetLearnt = 3;

type State = { currentUser: { email: string; id: string } | null };

type UserRequest = {
  email: string;
  password: string;
};

type UserResponse = {
  id: string;
  email: string;
};

type AuthUserResponse = {
  message: 'string';
  token: 'string';
  refreshToken: 'string';
  userId: 'string';
};

export type StatResponse = {
  id: string;
  learnedWords: number;
  optional: {
    date: Date;
    sprintGame?: {
      gamesPlayed: number;
      totalCorrectWords: number;
      mostWordsInRow: number;
      newWords: number;
    };
    audioGame?: {
      gamesPlayed: number;
      totalCorrectWords: number;
      mostWordsInRow: number;
      newWords: number;
    };
    learnedPages?: {
      [key: number]: Array<number>;
    };
  };
};

export const createUser = async (user: UserRequest) => {
  const response = await client.post<unknown, UserResponse>('/users', user);
  stats.id = state.currentUser?.id;
  stats.update();
  return response;
};

export const loginUser = async (user: UserRequest) => {
  const response = await client.post<unknown, { data: AuthUserResponse }>('/signin', user);
  localStorage.setItem('currentUserId', response.data.userId);
  const currentUser = await getCurrentUser();
  state.currentUser = currentUser;
  const userEmail = document.querySelector('.user-email');
  if (userEmail && state.currentUser?.email) {
    userEmail.innerHTML = state.currentUser.email;
  }
  renderAuthElements();
  await stats.get();
  stats.id = state.currentUser?.id;
  await stats.send();
  return response.data;
};

export const createUserWord = async ({ userId, wordId, userWord }: iUserWordCreator) => {
  const response = await client.post(`/users/${userId}/words/${wordId}`, userWord);
  return response;
};

export const getUserWords = async (userId: string) => {
  const response = await client.get(`/users/${userId}/words/`);
  return response;
};

export const changeUserWord = async ({ userId, wordId, userWord }: iUserWordCreator) => {
  const response = await client.put(`/users/${userId}/words/${wordId}`, userWord);
  return response;
};

export const refreshToken = async () => {
  localStorage.removeItem('token');
  const oldRefreshToken = localStorage.getItem('refreshToken');
  // const id = state.currentUser?.id || localStorage.getItem('currentUserId');
  // if (!id) return null;
  const { token, refreshToken: rtoken } = await client.get<unknown, { token: string; refreshToken: string }>(
    `/users/${state.currentUser?.id}/tokens`,
    {
      headers: {
        Authorization: `Bearer ${oldRefreshToken}`,
      },
    }
  );
  return { token, refreshToken: rtoken };
};

export const logOut = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUserId');
  state.currentUser = null;
  const userEmail = document.querySelector<HTMLElement>('.user-email');
  if (userEmail) {
    userEmail.innerHTML = '';
  }
  renderAuthElements();
};

export const getCurrentUser = async () => {
  const userId = localStorage.getItem('currentUserId');
  if (userId) {
    const response = await client.get<unknown, { data: { email: string; id: string } }>(`/users/${userId}`);
    const userEmail = document.querySelector('.user-email');
    if (userEmail) {
      userEmail.innerHTML = response?.data.email;
    }
    state.currentUser = response.data;
    renderAuthElements();
    return response.data;
  }
  return null;
};

export const countAnswersForUserWord = async (wordId: string, isTrue: boolean) => {
  const config = {
    userId: state.currentUser?.id,
    wordId,
    userWord: {
      difficulty: 'basic',
      optional: {
        done: false,
        date: new Date(),
        rightAnswers: 0,
        wrongAnswers: 0,
        seriesOfRight: '0',
      },
    },
  };
  async function changeConfig() {
    if (isTrue) {
      config.userWord.optional.rightAnswers += 1;
      config.userWord.optional.seriesOfRight += '1';
    } else {
      config.userWord.optional.wrongAnswers += 1;
      config.userWord.optional.seriesOfRight += '0';
    }
    const series = config.userWord.optional.seriesOfRight.slice(-numberOfCorrectAnswersToGetLearnt);
    if (series === '111') {
      console.log('make word learnt');
      config.userWord.optional.done = true;
    } else {
      config.userWord.optional.done = false;
    }
  }
  if (await isUserWord(wordId)) {
    console.log('is user word');
    const response = await client.get(`/users/${state.currentUser?.id}/aggregatedWords/${wordId}`);
    config.userWord = response.data[0].userWord;
    await changeConfig();
    await changeUserWord(config);
  } else {
    await changeConfig();
    await createUserWord(config);
  }
};

const isUserWord = async (id: string) => {
  let result = false;
  try {
    const response = await client.get(`/users/${state.currentUser?.id}/aggregatedWords/${id}`);
    if (response.data[0].userWord) {
      result = true;
    }
  } catch (err) {
    console.log(err);
  }
  return result;
};
