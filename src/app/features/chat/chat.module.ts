import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';

import {ChatRoutingModule} from './chat-routing.module';
import {ChatPageComponent} from './pages/chat-page/chat-page.component';

@NgModule({
  declarations: [ChatPageComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ChatRoutingModule],
})
export class ChatModule {
}

