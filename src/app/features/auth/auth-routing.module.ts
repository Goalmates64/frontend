import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { authGuard } from '../../core/auth.guard';

const routes: Routes = [
  { path: '', component: AuthComponent, data: { title: 'Espace membre' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Creer un compte' } },
  { path: 'login', component: LoginComponent, data: { title: 'Connexion' } },
  { path: 'verify-email', component: VerifyEmailComponent, data: { title: 'Verification email' } },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { title: 'Mot de passe oublie' },
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { title: 'Reinitialiser le mot de passe' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
    data: { title: 'Changer de mot de passe' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
