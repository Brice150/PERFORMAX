import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { Exercise } from '../core/interfaces/exercise';
import { Session } from '../core/interfaces/session';
import { SessionsService } from '../core/services/sessions.service';
import { SessionCardComponent } from './session-card/session-card.component';

@Component({
  selector: 'app-sessions',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    SessionCardComponent,
    RouterModule,
  ],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.css',
})
export class SessionsComponent implements OnInit, OnDestroy {
  sessionsService = inject(SessionsService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  sessions: Session[] = [];
  toastr = inject(ToastrService);
  router = inject(Router);

  ngOnInit(): void {
    this.sessionsService
      .getSessions()
      .pipe(takeUntil(this.destroyed$), take(1))
      .subscribe({
        next: (sessions: Session[]) => {
          if (sessions?.length >= 0) {
            this.sessions = sessions;
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Sessions', {
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

    this.sessionsService
      .addSession(session)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (sessionId: string) => {
          this.loading = false;
          this.router.navigate(['/session/' + sessionId]);
          this.toastr.info('Session added', 'Sessions', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Sessions', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
