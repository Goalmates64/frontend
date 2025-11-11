import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';

import {MainLayoutComponent} from './layout/main-layout/main-layout.component';
import {ButtonComponent} from './ui/button/button.component';
import {NavbarComponent} from './layout/navbar/navbar.component';
import {ToastContainerComponent} from './ui/toast-container/toast-container.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    ButtonComponent,
    NavbarComponent,
    ToastContainerComponent,
  ],
  exports: [
    NavbarComponent,
    ToastContainerComponent,
  ],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
})
export class SharedModule {}
