import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  { path: '', component: AuthComponent, data: { title: 'Espace membre' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Créer un compte' } },
  { path: 'login', component: LoginComponent, data: { title: 'Connexion' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
