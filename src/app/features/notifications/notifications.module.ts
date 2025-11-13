import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [NotificationsPageComponent],
  imports: [CommonModule, SharedModule, NotificationsRoutingModule],
})
export class NotificationsModule {}
