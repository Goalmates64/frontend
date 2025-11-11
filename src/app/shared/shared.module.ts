import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainLayoutComponent} from './layout/main-layout/main-layout.component';
import {ButtonComponent} from './ui/button/button.component';
import {NavbarComponent} from './layout/navbar/navbar.component';
import {RouterLink, RouterLinkActive} from "@angular/router";


@NgModule({
  declarations: [
    MainLayoutComponent,
    ButtonComponent,
    NavbarComponent
  ],
  exports: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ]
})
export class SharedModule {
}
