import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, take, takeUntil } from 'rxjs';
import { Exercise } from '../core/interfaces/exercise';
import { Workout } from '../core/interfaces/workout';
import { WorkoutsService } from '../core/services/workouts.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-workout',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './workout.component.html',
  styleUrl: './workout.component.css',
})
export class WorkoutComponent implements OnInit, OnDestroy {
  updateNeeded: boolean = false;
  workout: Workout = {} as Workout;
  activatedRoute = inject(ActivatedRoute);
  workoutsService = inject(WorkoutsService);
  router = inject(Router);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  toastr = inject(ToastrService);
  dialog = inject(MatDialog);

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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.workout.exercises,
      event.previousIndex,
      event.currentIndex
    );
    if (event.previousIndex !== event.currentIndex) {
      this.toggleUpdateNeeded();
    }
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
    if (
      this.workout.title.length >= 2 &&
      this.workout.title.length <= 50 &&
      !this.workout.exercises.some(
        (measure) =>
          measure.title.length < 2 ||
          measure.title.length > 50 ||
          measure.repetitions.length > 20 ||
          measure.lastPerformance.length > 20
      )
    ) {
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
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Workout', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.toastr.info('Invalid workout', 'Workout', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }

  deleteWorkout(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this workout',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.workoutsService.deleteWorkout(this.workout.id!);
        }),
        takeUntil(this.destroyed$)
      )
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
