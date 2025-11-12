export interface NotificationSender {
  id: number;
  username: string;
}

export interface AppNotification {
  id: number;
  senderId: number | null;
  receiverId: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: NotificationSender | null;
}
