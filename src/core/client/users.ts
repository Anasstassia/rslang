import { client } from '.';
import { renderAuthElements, stats } from '../..';
import { iUserWordCreator, iUserWordResponse } from '../components/types';
import { getStat } from './stat';

export const state = {} as State;
const numberOfCorrectAnswersToGetLearnt = 3;

type State = {
  currentUser: { email: string; id: string } | null;
  sprintStatistics: StatResponse['optional']['sprintGame'];
  audioStatistics: StatResponse['optional']['audioGame'];
  learnedPagesStatistics: StatResponse['optional']['learnedPages'];
};

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
  const response = await client.post<unknown, { data: UserResponse }>('/users', user);
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
  // await stats.get();
  stats.id = state.currentUser?.id;
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
  const id = state.currentUser?.id || localStorage.getItem('currentUserId');
  if (!id) return null;
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
  document.location.reload();
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
    let stat;
    try {
      stat = await getStat();
    } catch (e) {
      const res = await client.put(`/users/${state.currentUser?.id}/statistics`, {
        learnedWords: 0,
        optional: {
          date: new Date(),
          sprintGame: {
            gamesPlayed: 0,
            totalCorrectWords: 0,
            mostWordsInRow: 0,
            newWords: 0,
          },
          audioGame: {
            gamesPlayed: 0,
            totalCorrectWords: 0,
            mostWordsInRow: 0,
            newWords: 0,
          },
          learnedPages: {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
          },
        },
      });
      stat = res.data;
    }
    state.sprintStatistics = stat.optional.sprintGame;
    state.audioStatistics = stat.optional.audioGame;
    state.learnedPagesStatistics = stat.optional.learnedPages;

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
      config.userWord.optional.done = true;
    } else {
      config.userWord.optional.done = false;
    }
  }
  if (state.currentUser) {
    if (await isUserWord(wordId)) {
      const response = await client.get(`/users/${state.currentUser?.id}/aggregatedWords/${wordId}`);
      config.userWord = response.data[0].userWord;
      await changeConfig();
      await changeUserWord(config);
    } else {
      await changeConfig();
      await createUserWord(config);
    }
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

export const checkScore = async (wordsList: string[]) => {
  const requests = wordsList.map((el) =>
    client.get<unknown, { data: iUserWordResponse }>(`/users/${state.currentUser?.id}/words/${el}`)
  );
  const results = await Promise.all(requests);
  return results
    .map((result) => result.data.optional.rightAnswers + result.data.optional.wrongAnswers)
    .filter((el) => el === 1).length;
};
