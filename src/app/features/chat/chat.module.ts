import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ChatPageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SharedModule,
    ChatRoutingModule,
  ],
})
export class ChatModule {}
