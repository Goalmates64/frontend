export type MatchStatus = 'scheduled' | 'played' | 'canceled';

export type DashboardMatchAttendanceStatus = 'present' | 'absent';

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'steady';
  trendLabel: string;
  badge?: string;
}

export interface DashboardMatchSummary {
  id: number;
  startsAt: string;
  placeName: string;
  placeCity: string | null;
  status: 'confirmed' | 'pending';
  homeTeamName: string;
  homeLogoUrl: string | null;
  awayTeamName: string;
  awayLogoUrl: string | null;
  readiness: number;
}

export interface DashboardQuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: string;
}

export interface TeamAvailability {
  id: string;
  teamName: string;
  availabilityRate: number;
  confidence: 'high' | 'medium' | 'low';
  nextMatchAt: string | null;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'match' | 'notification';
  statusLabel?: string;
}

export interface WeeklyMatchLoad {
  dayLabel: string;
  matches: number;
}

export interface RecommendedPlace {
  id: number;
  name: string;
  city: string;
  countryCode: string;
  distanceKm: number | null;
}

export interface TrainingFocus {
  id: string;
  title: string;
  progress: number;
  badge: string;
}

export interface DashboardUpcomingMatch {
  id: number;
  startsAt: string;
  label: string;
  status: MatchStatus;
}

export interface DashboardTeamMember {
  id: number;
  userId: number;
  teamId: number;
  isCaptain: boolean;
  joinedAt: string;
}

export interface DashboardTeam {
  id: number;
  name: string;
  inviteCode: string;
  isPublic: boolean;
  logoUrl: string | null;
  createdAt: string;
  memberCount: number;
  members: DashboardTeamMember[];
}

export interface DashboardMatchAttendance {
  id: number;
  matchId: number;
  userId: number;
  status: DashboardMatchAttendanceStatus;
  reason: string | null;
  respondedAt: string | null;
}

export interface DashboardMatch {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  place: {
    id: number | null;
    name: string | null;
    city: string | null;
  } | null;
  homeTeam?: Pick<DashboardTeam, 'id' | 'name' | 'logoUrl'>;
  awayTeam?: Pick<DashboardTeam, 'id' | 'name' | 'logoUrl'>;
  attendances?: DashboardMatchAttendance[];
}

export interface DashboardOverview {
  stats: DashboardStat[];
  nextMatch: DashboardMatchSummary | null;
  quickActions: DashboardQuickAction[];
  teamAvailability: TeamAvailability[];
  recentActivity: DashboardActivity[];
  weeklyLoad: WeeklyMatchLoad[];
  recommendedPlaces: RecommendedPlace[];
  trainingFocus: TrainingFocus[];
  upcomingMatchesPreview: DashboardUpcomingMatch[];
  raw: {
    teams: DashboardTeam[];
    upcomingMatches: DashboardMatch[];
    previousMatches: DashboardMatch[];
    notifications: Array<{
      id: number;
      senderId: number | null;
      receiverId: number;
      title: string;
      body: string;
      isRead: boolean;
      createdAt: string;
      sender: { id: number; username: string } | null;
    }>;
    places: RecommendedPlace[];
  };
}
