import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { Workout } from '../core/interfaces/workout';
import { WorkoutsService } from '../core/services/workouts.service';

@Component({
  selector: 'app-workouts',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css',
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  workoutsService = inject(WorkoutsService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  workouts: Workout[] = [];
  toastr = inject(ToastrService);
  updateNeeded: boolean = false;

  ngOnInit(): void {
    this.workoutsService
      .getWorkouts()
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe({
        next: (workouts: Workout[]) => {
          if (workouts?.length >= 0) {
            this.workouts = workouts;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Workouts', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  toggleUpdateNeeded(): void {
    this.updateNeeded = true;
  }

  addWorkout(): void {
    this.loading = true;
    const workout: Workout = {
      title: 'Workout',
      exercises: [],
    };

    this.workoutsService
      .addWorkout(workout)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.workouts.push(workout);
          this.loading = false;
          this.toastr.info('Workout added', 'Workouts', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Workouts', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
