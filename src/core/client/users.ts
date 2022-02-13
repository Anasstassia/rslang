import { client } from '.';
import { renderAuthElements } from '../..';
import { iUserWordCreator } from '../components/types';

export const state = {} as State;

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

export const createUser = async (user: UserRequest) => {
  const response = await client.post<unknown, UserResponse>('/users', user);
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
  return response.data;
};

export const createUserWord = async ({ userId, wordId, word }: iUserWordCreator) => {
  const response = await client.post(`/users/${userId}/words/${wordId}`, word);
  return response;
};

export const getUserWords = async (userId: string) => {
  const response = await client.get(`/users/${userId}/words/`);
  return response;
};

export const changeUserWord = async ({ userId, wordId, word }: iUserWordCreator) => {
  const response = await client.put(`/users/${userId}/words/${wordId}`, word);
  return response;
};

export const refreshToken = async () => {
  localStorage.removeItem('token');
  const oldRefreshToken = localStorage.getItem('refreshToken');

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
