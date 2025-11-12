import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild
} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize, take} from 'rxjs/operators';

import {ChatService} from '../../../../core/chat.service';
import {ChatMessage, ChatRoom} from '../../../../core/models/chat.model';
import {User} from '../../../../core/models/user.model';
import {AuthService} from '../../../../core/auth.service';

@Component({
  selector: 'app-chat-page',
  standalone: false,
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent {
  rooms: ChatRoom[] = [];
  roomsLoading = false;
  roomsError: string | null = null;

  selectedRoomId: number | null = null;
  messageLoading = false;
  historyLoading = false;
  sending = false;
  messageError: string | null = null;

  currentUser: User | null = null;
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  private readonly fb = inject(FormBuilder);
  readonly messageForm = this.fb.nonNullable.group({
    content: ['', [Validators.maxLength(1000)]],
  });
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messagesMap = new Map<number, ChatMessage[]>();
  private readonly cursorMap = new Map<number, number | null>();

  constructor() {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const wasEnabled = this.currentUser?.isChatEnabled;
        this.currentUser = user;
        if (user?.isChatEnabled && !this.rooms.length && !this.roomsLoading) {
          this.reloadRooms();
        }
        if (wasEnabled && !user?.isChatEnabled) {
          this.selectedRoomId = null;
        }
        this.cdr.markForCheck();
      });

    this.chatService.rooms$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rooms) => {
        this.rooms = rooms;
        this.roomsError = null;
        if (
          rooms.length > 0 &&
          this.currentUser?.isChatEnabled &&
          (!this.selectedRoomId || !rooms.some((room) => room.id === this.selectedRoomId))
        ) {
          this.selectRoom(rooms[0].id);
        } else if (!rooms.length) {
          this.selectedRoomId = null;
        }
        this.cdr.markForCheck();
      });

    this.chatService.incomingMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.appendMessage(message);
      });
  }

  get selectedRoom(): ChatRoom | null {
    return this.rooms.find((room) => room.id === this.selectedRoomId) ?? null;
  }

  get selectedMessages(): ChatMessage[] {
    if (!this.selectedRoomId) {
      return [];
    }
    return this.messagesMap.get(this.selectedRoomId) ?? [];
  }

  get canSend(): boolean {
    return !!this.selectedRoomId && !!this.currentUser?.isChatEnabled;
  }

  reloadRooms(): void {
    if (!this.currentUser?.isChatEnabled) {
      return;
    }
    this.roomsLoading = true;
    this.roomsError = null;
    this.chatService
      .loadRooms()
      .pipe(
        take(1),
        finalize(() => {
          this.roomsLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        error: (error: HttpErrorResponse) => {
          this.roomsError = this.extractErrorMessage(error);
        },
      });
  }

  selectRoom(roomId: number): void {
    if (!this.currentUser?.isChatEnabled) {
      return;
    }

    if (this.selectedRoomId === roomId && this.messagesMap.has(roomId)) {
      this.scrollMessagesToBottom();
      return;
    }

    this.selectedRoomId = roomId;
    this.messageError = null;
    if (!this.messagesMap.has(roomId)) {
      this.loadMessages(roomId, undefined, true);
    } else {
      this.scrollMessagesToBottom();
      this.cdr.markForCheck();
    }
  }

  loadOlderMessages(): void {
    if (!this.selectedRoomId) {
      return;
    }
    const cursor = this.cursorMap.get(this.selectedRoomId);
    if (cursor === null || cursor === undefined) {
      return;
    }
    this.loadMessages(this.selectedRoomId, cursor, false);
  }

  onSendMessage(): void {
    if (!this.selectedRoomId || !this.currentUser?.isChatEnabled || this.sending) {
      return;
    }

    const content = this.messageForm.controls.content.value.trim();
    if (!content) {
      return;
    }

    this.sending = true;
    this.messageError = null;
    this.chatService
      .sendMessage(this.selectedRoomId, content)
      .pipe(
        take(1),
        finalize(() => {
          this.sending = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (message) => {
          this.messageForm.reset({content: ''});
          this.appendMessage(message);
          this.scrollMessagesToBottom();
        },
        error: (error: HttpErrorResponse) => {
          this.messageError = this.extractErrorMessage(error);
        },
      });
  }

  roomSubtitle(room: ChatRoom): string {
    if (room.type === 'team') {
      return "Salon d'équipe";
    }
    if (room.type === 'match' && room.match) {
      return `${room.match.homeTeam.name} vs ${room.match.awayTeam.name}`;
    }
    return 'Communauté générale';
  }

  hasMoreHistory(roomId: number | null): boolean {
    if (!roomId) {
      return false;
    }
    return (this.cursorMap.get(roomId) ?? null) !== null;
  }

  private loadMessages(roomId: number, beforeId?: number, replace = false): void {
    const isHistoryLoad = beforeId !== undefined;
    if (isHistoryLoad) {
      this.historyLoading = true;
    } else {
      this.messageLoading = true;
    }

    this.chatService
      .fetchMessages(roomId, beforeId)
      .pipe(
        take(1),
        finalize(() => {
          if (isHistoryLoad) {
            this.historyLoading = false;
          } else {
            this.messageLoading = false;
          }
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.mergeMessages(roomId, response.messages, replace);
          this.cursorMap.set(roomId, response.nextCursor);
          if (!isHistoryLoad) {
            this.scrollMessagesToBottom();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.messageError = this.extractErrorMessage(error);
        },
      });
  }

  private mergeMessages(roomId: number, messages: ChatMessage[], replace: boolean): void {
    const existing = replace ? [] : this.messagesMap.get(roomId) ?? [];
    const combined = replace ? messages : [...messages, ...existing];
    const deduped = Array.from(
      new Map(combined.map((message) => [message.id, message])).values(),
    ).sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    this.messagesMap.set(roomId, deduped);
  }

  private appendMessage(message: ChatMessage): void {
    const existing = this.messagesMap.get(message.roomId) ?? [];
    if (existing.some((entry) => entry.id === message.id)) {
      return;
    }
    const updated = [...existing, message].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    this.messagesMap.set(message.roomId, updated);
    if (message.roomId === this.selectedRoomId) {
      this.scrollMessagesToBottom();
    }
    this.cdr.markForCheck();
  }

  private scrollMessagesToBottom(): void {
    if (!this.messagesContainer) {
      return;
    }
    requestAnimationFrame(() => {
      if (!this.messagesContainer) {
        return;
      }
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return Array.isArray(error.error.message)
        ? error.error.message.join(' ')
        : String(error.error.message);
    }
    return 'Impossible de charger le chat pour le moment.';
  }
}

