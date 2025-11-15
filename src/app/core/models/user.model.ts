import { Place } from './place.model';

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
  isChatEnabled: boolean;
  isEmailVerified: boolean;
}

export type UpdateProfilePayload = {
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  city?: string | null;
  country?: string | null;
  isChatEnabled?: boolean;
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
  isPublic: boolean;
  logoUrl: string | null;
}

export interface PublicTeamSummary {
  id: number;
  name: string;
  isPublic: boolean;
  logoUrl: string | null;
  memberCount: number;
}

export type MatchAttendanceStatus = 'present' | 'absent';

export interface MatchAttendance {
  id: number;
  matchId: number;
  userId: number;
  status: MatchAttendanceStatus;
  reason: string | null;
  respondedAt: string | null;
}

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string;
  placeId: number | null;
  place?: Place | null;
  status: 'scheduled' | 'played' | 'canceled';
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
  homeTeam?: Team;
  awayTeam?: Team;
  attendances?: MatchAttendance[];
}
