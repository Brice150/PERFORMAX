import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { Subject, switchMap, take, takeUntil } from 'rxjs';
import { Exercise } from '../core/interfaces/exercise';
import { Workout } from '../core/interfaces/workout';
import { WorkoutsService } from '../core/services/workouts.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-workout',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css',
})
export class WorkoutComponent implements OnInit {
  updateNeeded: boolean = false;
  workout: Workout = {} as Workout;
  activatedRoute = inject(ActivatedRoute);
  workoutsService = inject(WorkoutsService);
  router = inject(Router);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  toastr = inject(ToastrService);

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const workoutId = params['id'];
          return this.workoutsService.getWorkout(workoutId);
        }),
        take(1)
      )
      .subscribe({
        next: (workout: Workout | null) => {
          if (workout) {
            this.workout = workout;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Workout', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  toggleUpdateNeeded(): void {
    this.updateNeeded = true;
  }

  addExercise(): void {
    const exercise: Exercise = {
      title: 'Exercise 1',
      repetitions: '4x10',
      lastPerformance: '20 kg',
    };

    this.workout.exercises.push(exercise);
    this.updateWorkout();
  }

  deleteExercise(index: number): void {
    this.workout.exercises.splice(index, 1);
    this.updateWorkout();
  }

  updateWorkout(): void {
    this.loading = true;

    this.workoutsService
      .updateWorkout(this.workout)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.updateNeeded = false;
          this.loading = false;
          this.toastr.info('Workout updated', 'Workout', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  deleteWorkout(): void {
    this.loading = true;

    this.workoutsService
      .deleteWorkout(this.workout.id!)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/workout']);
          this.loading = false;
          this.toastr.info('Workout deleted', 'Workout', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Workout', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
