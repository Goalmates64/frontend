import { User } from './user.model';

export interface LoginPayload {
  email: string;
  password: string;
  twoFactorCode?: string | null;
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

export interface RegisterResponse {
  message: string;
  requiresEmailVerification: boolean;
}

export interface TwoFactorSetupResponse {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
