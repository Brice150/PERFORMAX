import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Measure } from '../core/interfaces/measure';
import { Progress } from '../core/interfaces/progress';
import { ProgressService } from '../core/services/progress.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MeasureDialogComponent } from '../shared/components/measure-dialog/measure-dialog.component';
import { MeasureCardComponent } from './measure-card/measure-card.component';

@Component({
  selector: 'app-progress',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MeasureCardComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
})
export class ProgressComponent implements OnInit, OnDestroy {
  progressService = inject(ProgressService);
  destroyed$ = new Subject<void>();
  loading: boolean = true;
  progress: Progress = {} as Progress;
  toastr = inject(ToastrService);
  datePipe: DatePipe = new DatePipe('fr');
  graph?: Chart<'line', number[], string>;
  dialog = inject(MatDialog);
  years: number[] = [];
  year!: number;

  ngOnInit(): void {
    this.progress.measures = [];
    this.progressService
      .getProgress()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (progress: Progress[]) => {
          if (progress[0]?.measures?.length >= 0) {
            this.progress = progress[0];
            this.progress.measures = this.progress.measures.map((measure) => ({
              ...measure,
              date:
                measure.date instanceof Timestamp
                  ? measure.date.toDate()
                  : new Date(measure.date),
            }));

            this.progress.measures.sort(
              (a, b) => a.date.getTime() - b.date.getTime()
            );

            const yearsSet = new Set(
              this.progress.measures.map((m) => m.date.getFullYear())
            );
            this.years = Array.from(yearsSet).sort((a, b) => b - a);
            this.year = this.years[0];
          }

          this.loading = false;
          this.displayGraph();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Progress', {
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

  displayGraph(): void {
    const graph = document.getElementById('graph') as HTMLCanvasElement | null;
    if (graph) {
      this.graph = new Chart(graph, {
        type: 'line',
        data: {
          labels: this.progress.measures.map(
            (measure) => this.datePipe.transform(measure.date, 'dd/MM/yyyy')!
          ),
          datasets: [
            {
              label: 'Weight (kg)',
              data: this.progress.measures.map((measure) => measure.weight),
            },
            {
              label: 'Muscle (%)',
              data: this.progress.measures.map((measure) => measure.muscle),
            },
            {
              label: 'Fat (%)',
              data: this.progress.measures.map((measure) => measure.fat),
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 16,
                  weight: 800,
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
                font: {
                  size: 18,
                  weight: 800,
                },
                color: '#38a95a',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Value (kg or %)',
                font: {
                  size: 18,
                  weight: 800,
                },
                color: '#38a95a',
              },
            },
          },
        },
      });
    }
  }

  updateGraph(): void {
    if (this.graph) {
      this.graph.data.labels = this.progress.measures.map(
        (measure) => this.datePipe.transform(measure.date, 'dd/MM/yyyy')!
      );
      this.graph.data.datasets[0].data = this.progress.measures.map(
        (measure) => measure.weight
      );
      this.graph.data.datasets[1].data = this.progress.measures.map(
        (measure) => measure.muscle
      );
      this.graph.data.datasets[2].data = this.progress.measures.map(
        (measure) => measure.fat
      );
      this.graph.update();
    }
  }

  addProgress(): void {
    this.loading = true;

    let lastMeasure: Measure | undefined;

    if (this.progress.measures.length > 0) {
      lastMeasure = this.progress.measures[this.progress.measures.length - 1];
    }

    const measure: Measure = {
      id: this.progress.measures.length,
      date: new Date(),
      weight: lastMeasure?.weight ?? 70,
      fat: lastMeasure?.fat ?? 20,
      muscle: lastMeasure?.muscle ?? 73,
    };
    this.progress.measures.push(measure);

    this.saveUserProgress('added');
  }

  deleteMeasure(measureId: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this measure',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res: boolean) => res))
      .subscribe({
        next: () => {
          const index = this.progress.measures.findIndex(
            (m) => m.id === measureId
          );
          if (index !== -1) {
            this.progress.measures.splice(index, 1);
            this.saveUserProgress('deleted');
          }
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  saveUserProgress(toastrMessage: string): void {
    this.loading = true;
    this.progress.measures.sort((a, b) => a.date.getTime() - b.date.getTime());
    if (!this.progress.id) {
      this.progressService
        .addProgress(this.progress)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateGraph();
            this.toastr.info('Measure added', 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Progress', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.progressService
        .updateProgress(this.progress)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateGraph();
            this.toastr.info('Measure ' + toastrMessage, 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'progress', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    }
  }

  updateProgress(measure: Measure): void {
    const dialogRef = this.dialog.open(MeasureDialogComponent, {
      data: structuredClone(measure),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Measure) => {
          this.loading = true;
          const index = this.progress.measures.findIndex(
            (m) => m.id === res.id
          );
          if (index !== -1) {
            this.progress.measures[index] = res;
          }
          return this.progressService.updateProgress(this.progress);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.updateGraph();
          this.toastr.info('Measure updated', 'Progress', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
