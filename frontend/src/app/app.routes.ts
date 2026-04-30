import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { RoundsComponent } from './rounds/rounds';
import { RoundDetailComponent } from './round-detail/round-detail';
import { ActiveMatchesComponent } from './active-matches/active-matches';
import { HistoryComponent } from './history/history';
import { authGuard } from './auth/auth.guard';
import { NotFoundComponent } from './not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: RoundsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'rounds/:id',
    component: RoundDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'active',
    component: ActiveMatchesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'history',
    component: HistoryComponent,
    canActivate: [authGuard],
  },

  { path: '**', component: NotFoundComponent },
];