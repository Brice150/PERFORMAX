import { Routes } from '@angular/router';
import { userGuard } from './core/guards/user.guard';
import { noUserGuard } from './core/guards/no-user.guard';
import { ConnectComponent } from './connect/connect.component';
import { ProfileComponent } from './profile/profile.component';
import { ProgressComponent } from './progress/progress.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { WorkoutComponent } from './workouts/workout/workout.component';

export const routes: Routes = [
  { path: 'connect', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: '', component: WorkoutsComponent, canActivate: [userGuard] },
  {
    path: 'workout/:id',
    component: WorkoutComponent,
    canActivate: [userGuard],
  },
  { path: 'progress', component: ProgressComponent, canActivate: [userGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
