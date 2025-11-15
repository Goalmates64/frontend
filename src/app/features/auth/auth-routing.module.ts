import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

const routes: Routes = [
  { path: '', component: AuthComponent, data: { title: 'Espace membre' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Créer un compte' } },
  { path: 'login', component: LoginComponent, data: { title: 'Connexion' } },
  { path: 'verify-email', component: VerifyEmailComponent, data: { title: 'Vérification email' } },
  { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Mot de passe oublié' } },
  { path: 'reset-password', component: ResetPasswordComponent, data: { title: 'Réinitialiser le mot de passe' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
