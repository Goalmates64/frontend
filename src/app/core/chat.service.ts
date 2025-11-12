import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable, Subject, take} from 'rxjs';
import {tap} from 'rxjs/operators';
import {io, Socket} from 'socket.io-client';

import {environment} from '../../environments/environment';
import {ChatMessage, ChatMessagesResponse, ChatRoom} from './models/chat.model';
import {AuthService} from './auth.service';
import {ToastService} from './toast.service';

@Injectable({providedIn: 'root'})
export class ChatService {
  private readonly baseUrl = `${environment.apiUrl}/chat`;
  private readonly roomsSubject = new BehaviorSubject<ChatRoom[]>([]);
  readonly rooms$ = this.roomsSubject.asObservable();
  private readonly incomingMessagesSubject = new Subject<ChatMessage>();
  readonly incomingMessages$ = this.incomingMessagesSubject.asObservable();
  private socket: Socket | null = null;
  private readonly wsNamespaceUrl = this.buildWsNamespaceUrl();
  private connectedUserId: number | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly toast: ToastService,
  ) {
    combineLatest([this.authService.isAuthenticated$, this.authService.currentUser$]).subscribe(
      ([isAuthenticated, user]) => {
        if (isAuthenticated && user?.isChatEnabled) {
          if (this.connectedUserId !== user.id) {
            const token = this.authService.token;
            if (token) {
              this.connectSocket(token);
              this.connectedUserId = user.id;
              this.loadRooms()
                .pipe(take(1))
                .subscribe({
                  error: () => this.roomsSubject.next([]),
                });
            }
          }
        } else {
          this.connectedUserId = null;
          this.disconnectSocket();
          this.roomsSubject.next([]);
        }
      },
    );
  }

  loadRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.baseUrl}/rooms`).pipe(
      tap((rooms) => this.roomsSubject.next(rooms)),
    );
  }

  fetchMessages(roomId: number, beforeId?: number): Observable<ChatMessagesResponse> {
    const params = beforeId !== undefined ? {beforeId} : undefined;
    return this.http.get<ChatMessagesResponse>(`${this.baseUrl}/rooms/${roomId}/messages`, {
      params: params as any,
    });
  }

  sendMessage(roomId: number, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/rooms/${roomId}/messages`, {content});
  }

  private connectSocket(token: string): void {
    if (this.socket) {
      return;
    }

    this.socket = io(this.wsNamespaceUrl, {
      transports: ['websocket'],
      auth: {token},
      autoConnect: true,
    });

    this.socket.on('chat:message', (message: ChatMessage) => {
      this.incomingMessagesSubject.next(message);
    });

    this.socket.on('chat:disabled', () => {
      this.toast.info('Tu as dÃ©sactivÃ© le chat pour ce compte.');
    });

    this.socket.on('disconnect', () => {
      // Socket.IO will auto-retry if possible. Nothing to do for now.
    });
  }

  private disconnectSocket(): void {
    if (!this.socket) {
      return;
    }
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  private buildWsNamespaceUrl(): string {
    const trimmed = environment.apiUrl.replace(/\/$/, '');
    if (trimmed.endsWith('/api')) {
      return `${trimmed.slice(0, -4)}/chat`;
    }
    return `${trimmed}/chat`;
  }
}


