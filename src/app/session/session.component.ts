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
import { Session } from '../core/interfaces/session';
import { SessionsService } from '../core/services/sessions.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-session',
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
  templateUrl: './session.component.html',
  styleUrl: './session.component.css',
})
export class SessionComponent implements OnInit, OnDestroy {
  updateNeeded: boolean = false;
  session: Session = {} as Session;
  activatedRoute = inject(ActivatedRoute);
  sessionsService = inject(SessionsService);
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
          const sessionId = params['id'];
          return this.sessionsService.getSession(sessionId);
        }),
        take(1)
      )
      .subscribe({
        next: (session: Session | null) => {
          if (session) {
            this.session = session;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Session', {
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
      this.session.exercises,
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

    this.session.exercises.push(exercise);
    this.updateSession();
  }

  deleteExercise(index: number): void {
    this.session.exercises.splice(index, 1);
    this.updateSession();
  }

  updateSession(): void {
    if (
      this.session.title.length >= 2 &&
      this.session.title.length <= 50 &&
      !this.session.exercises.some(
        (measure) =>
          measure.title.length < 2 ||
          measure.title.length > 50 ||
          measure.repetitions.length > 20 ||
          measure.lastPerformance.length > 20
      )
    ) {
      this.loading = true;

      this.sessionsService
        .updateSession(this.session)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.updateNeeded = false;
            this.loading = false;
            this.toastr.info('Session updated', 'Session', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Session', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.toastr.info('Invalid session', 'Session', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }

  deleteSession(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this session',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.sessionsService.deleteSession(this.session.id!);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/session']);
          this.loading = false;
          this.toastr.info('Session deleted', 'Session', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Session', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
