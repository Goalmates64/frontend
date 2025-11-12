export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
}

export type UpdateProfilePayload = {
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  city?: string | null;
  country?: string | null;
};

export interface UserSummary {
  id: number;
  username: string;
  email: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  isCaptain: boolean;
  joinedAt: string;
  user?: UserSummary | null;
}

export interface Team {
  id: number;
  name: string;
  inviteCode: string;
  createdAt: string;
  members: TeamMember[];
  memberCount?: number;
}

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string;
  location: string;
  status: 'scheduled' | 'played' | 'canceled';
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
  homeTeam?: Team;
  awayTeam?: Team;
}
