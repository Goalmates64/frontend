import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';

import {MainLayoutComponent} from './layout/main-layout/main-layout.component';
import {ButtonComponent} from './ui/button/button.component';
import {NavbarComponent} from './layout/navbar/navbar.component';
import {ToastContainerComponent} from './ui/toast-container/toast-container.component';
import {UserAutocompleteComponent} from './ui/user-autocomplete/user-autocomplete.component';
import {SpinnerComponent} from './ui/spinner/spinner.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    ButtonComponent,
    NavbarComponent,
    ToastContainerComponent,
    UserAutocompleteComponent,
    SpinnerComponent,
  ],
  exports: [
    NavbarComponent,
    ToastContainerComponent,
    UserAutocompleteComponent,
    SpinnerComponent,
  ],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
  ],
})
export class SharedModule {
}
