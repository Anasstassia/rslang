import { client } from '.';

type UserEmail = {
  email: string;
};

type UserId = {
  id: string;
};

type UserPassword = {
  password: string;
};

type UserResponse = UserEmail & UserId;
type UserRequest = UserEmail & UserPassword;
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
  const response = await client.post<unknown, AuthUserResponse>('/signin', user);
  return response;
};
