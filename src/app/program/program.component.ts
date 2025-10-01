import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Exercise } from '../core/interfaces/exercise';
import { Program } from '../core/interfaces/program';
import { Session } from '../core/interfaces/session';
import { ProgramsService } from '../core/services/programs.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SessionCardComponent } from './session-card/session-card.component';
import { SessionDialogComponent } from '../shared/components/session-dialog/session-dialog.component';

@Component({
  selector: 'app-program',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    SessionCardComponent,
    RouterModule,
  ],
  templateUrl: './program.component.html',
  styleUrl: './program.component.css',
})
export class ProgramComponent implements OnInit, OnDestroy {
  programsService = inject(ProgramsService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  program: Program = {} as Program;
  toastr = inject(ToastrService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((params) => {
          const programId = params['id'];
          return this.programsService.getProgram(programId);
        })
      )
      .subscribe({
        next: (program: Program | null) => {
          if (program) {
            this.program = program;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Program', {
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

  addSession(): void {
    this.loading = true;

    const exercise: Exercise = {
      title: 'Exercise 1',
      repetitions: '4x10',
      lastPerformance: '20 kg',
    };

    const session: Session = {
      title: 'Session 1',
      exercises: [exercise],
    };

    this.program.sessions.push(session);

    this.programsService
      .updateProgram(this.program)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Session added', 'Program', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Program', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  updateSession(session: Session, index: number): void {
    const dialogRef = this.dialog.open(SessionDialogComponent, {
      data: structuredClone(session),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Session) => {
          this.loading = true;
          this.program.sessions[index] = res;
          return this.programsService.updateProgram(this.program);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Session updated', 'Program', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Program', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  deleteSession(sessionIndex: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this session',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          this.program.sessions.splice(sessionIndex, 1);
          return this.programsService.updateProgram(this.program);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Session deleted', 'Program', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Program', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
