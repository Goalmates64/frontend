import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeModule } from './features/home/home.module';
import { guestGuard } from './core/guest.guard';
import { authGuard } from './core/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
    canMatch: [guestGuard],
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/teams/teams.module').then((m) => m.TeamsModule),
  },
  {
    path: 'places',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/places/places.module').then((m) => m.PlacesModule),
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/matches/matches.module').then((m) => m.MatchesModule),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/notifications/notifications.module').then(
        (m) => m.NotificationsModule,
      ),
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/chat/chat.module').then((m) => m.ChatModule),
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HomeModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
