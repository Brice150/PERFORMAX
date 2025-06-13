import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { Measure } from '../core/interfaces/measure';
import { Progress } from '../core/interfaces/progress';
import { ProgressService } from '../core/services/progress.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-progress',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
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
  updateNeeded: boolean = false;
  graph?: Chart<'line', number[], string>;
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.progress.measures = [];
    this.progressService
      .getProgress()
      .pipe(take(1), takeUntil(this.destroyed$))
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

  toggleUpdateNeeded(): void {
    this.updateNeeded = true;
  }

  addProgress(): void {
    this.loading = true;
    const measure: Measure = {
      date: new Date(),
      weight: 70,
      fat: 20,
      muscle: 73,
    };
    this.progress.measures.push(measure);

    this.saveUserProgress('added');
  }

  updateProgress(): void {
    if (
      !this.progress.measures.some(
        (measure) =>
          measure.weight < 0 ||
          measure.fat < 0 ||
          measure.muscle < 0 ||
          measure.weight > 300 ||
          measure.fat > 100 ||
          measure.muscle > 100 ||
          measure.fat + measure.muscle > 100
      ) &&
      this.progress.measures.every(
        (measure) =>
          measure.weight !== undefined &&
          measure.weight !== null &&
          measure.fat !== undefined &&
          measure.fat !== null &&
          measure.muscle !== undefined &&
          measure.muscle !== null &&
          measure.date !== undefined &&
          measure.date !== null
      )
    ) {
      this.saveUserProgress('updated');
    } else {
      this.toastr.info('Invalid measure', 'Progress', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }

  deleteMeasure(index: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this measure',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((res: boolean) => res))
      .subscribe({
        next: () => {
          this.progress.measures.splice(index, 1);
          this.saveUserProgress('deleted');
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
            this.updateNeeded = false;
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
}
