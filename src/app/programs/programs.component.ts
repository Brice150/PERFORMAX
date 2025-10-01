import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Exercise } from '../core/interfaces/exercise';
import { Program } from '../core/interfaces/program';
import { Session } from '../core/interfaces/session';
import { ProgramsService } from '../core/services/programs.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ProgramCardComponent } from './program-card/program-card.component';

@Component({
  selector: 'app-programs',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ProgramCardComponent,
    RouterModule,
  ],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.css',
})
export class ProgramsComponent implements OnInit, OnDestroy {
  programsService = inject(ProgramsService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  programs: Program[] = [];
  toastr = inject(ToastrService);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.programsService
      .getPrograms()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (programs: Program[]) => {
          if (programs?.length > 0) {
            this.programs = programs.sort(
              (a, b) => (a.date as any).seconds - (b.date as any).seconds
            );
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Programs', {
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

  addProgram(): void {
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

    const program: Program = {
      title: 'Program ' + (this.programs.length + 1),
      date: new Date(),
      sessions: [session],
    };

    this.programsService
      .addProgram(program)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Program added', 'Programs', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Programs', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  deleteProgram(programId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this program',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          return this.programsService.deleteProgram(programId);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.programs = this.programs.filter(
            (program) => program.id !== programId
          );
          this.loading = false;
          this.toastr.info('Program deleted', 'Programs', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Programs', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
