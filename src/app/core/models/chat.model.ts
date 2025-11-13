export type ChatRoomType = 'global' | 'team' | 'match';

export interface ChatRoom {
  id: number;
  type: ChatRoomType;
  name: string;
  description: string | null;
  createdAt: string;
  team?: {
    id: number;
    name: string;
  } | null;
  match?: {
    id: number;
    homeTeam: {
      id: number;
      name: string;
    };
    awayTeam: {
      id: number;
      name: string;
    };
    scheduledAt: string;
  } | null;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  nextCursor: number | null;
}
