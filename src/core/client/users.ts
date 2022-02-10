import { client } from '.';
import { iUserWordCreator } from '../components/types';

export const state = {} as State;

type State = { currentUser: AuthUserResponse | null };

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
  name: 'string';
};

export const createUser = async (user: UserRequest) => {
  const response = await client.post<unknown, UserResponse>('/users', user);
  return response;
};

export const loginUser = async (user: UserRequest) => {
  const response = await client.post<unknown, { data: AuthUserResponse }>('/signin', user);
  state.currentUser = response.data;
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
    `/users/${state.currentUser?.userId}/tokens`,
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
  state.currentUser = null;
};
