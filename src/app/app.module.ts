import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { authInterceptor } from './core/auth.interceptor';
import { toastInterceptor } from './core/toast.interceptor';

registerLocaleData(localeFr);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, toastInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
