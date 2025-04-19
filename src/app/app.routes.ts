import { Routes } from '@angular/router';
import { userGuard } from './core/guards/user.guard';
import { noUserGuard } from './core/guards/no-user.guard';
import { ConnectComponent } from './connect/connect.component';
import { ProfileComponent } from './profile/profile.component';
import { ProgramsComponent } from './programs/programs.component';
import { ProgressComponent } from './progress/progress.component';

export const routes: Routes = [
  { path: 'connect', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: '', component: ProgramsComponent, canActivate: [userGuard] },
  { path: 'progress', component: ProgressComponent, canActivate: [userGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
