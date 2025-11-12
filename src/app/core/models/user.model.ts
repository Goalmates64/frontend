export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  city: string | null;
  country: string | null;
}

export type UpdateProfilePayload = {
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  city?: string | null;
  country?: string | null;
};
