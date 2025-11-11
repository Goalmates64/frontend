import {User} from './user.model';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
