import { Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfileComponent } from './profile/profile.component';
import { ProgramComponent } from './program/program.component';
import { ProgramsComponent } from './programs/programs.component';
import { ProgressComponent } from './progress/progress.component';

export const routes: Routes = [
  { path: 'connect', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: 'programs', component: ProgramsComponent, canActivate: [userGuard] },
  {
    path: 'programs/:id',
    component: ProgramComponent,
    canActivate: [userGuard],
  },
  { path: 'progress', component: ProgressComponent, canActivate: [userGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: 'programs', pathMatch: 'full' },
];
