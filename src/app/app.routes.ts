import { Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfileComponent } from './profile/profile.component';
import { ProgressComponent } from './progress/progress.component';
import { SessionComponent } from './session/session.component';
import { SessionsComponent } from './sessions/sessions.component';

export const routes: Routes = [
  { path: 'connect', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'sessions', component: SessionsComponent, canActivate: [userGuard] },
  {
    path: 'sessions/:id',
    component: SessionComponent,
    canActivate: [userGuard],
  },
  { path: 'progress', component: ProgressComponent, canActivate: [userGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: 'sessions', pathMatch: 'full' },
];
