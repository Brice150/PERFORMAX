import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgramsService } from '../core/services/programs.service';
import { Subject, take, takeUntil } from 'rxjs';
import { Programs } from '../core/interfaces/programs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Program } from '../core/interfaces/program';

@Component({
  selector: 'app-programs',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.css',
})
export class ProgramsComponent implements OnInit, OnDestroy {
  programsService = inject(ProgramsService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  programs: Programs = {} as Programs;
  toastr = inject(ToastrService);

  ngOnInit(): void {
    this.programs.programs = [];
    this.programsService
      .getPrograms()
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe({
        next: (programs: Programs[]) => {
          if (programs[0]?.programs?.length >= 0) {
            this.programs = programs[0];
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
    const program: Program = {
      title: 'Program',
      exercises: [],
    };
    this.programs.programs.push(program);

    this.programsService
      .addPrograms(this.programs)
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
}
