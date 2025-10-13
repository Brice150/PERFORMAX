import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { Measure } from '../../../core/interfaces/measure';
import { Progress } from '../../../core/interfaces/progress';
import { DisableScrollDirective } from '../../directives/disable-scroll.directive';

@Component({
  selector: 'app-measure-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    DisableScrollDirective,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './measure-dialog.component.html',
  styleUrl: './measure-dialog.component.css',
})
export class MeasureDialogComponent implements OnInit {
  measure: Measure = {} as Measure;
  mode: string = 'Add';
  toastr = inject(ToastrService);

  constructor(
    public dialogRef: MatDialogRef<MeasureDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      measure: Measure;
      mode: 'Update';
    }
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.measure = this.data.measure;
      this.mode = this.data.mode;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (
      !(
        this.measure.weight < 0 ||
        this.measure.fat < 0 ||
        this.measure.muscle < 0 ||
        this.measure.weight > 300 ||
        this.measure.fat > 100 ||
        this.measure.muscle > 100 ||
        this.measure.fat + this.measure.muscle > 100
      ) &&
      this.measure.weight !== undefined &&
      this.measure.weight !== null &&
      this.measure.fat !== undefined &&
      this.measure.fat !== null &&
      this.measure.muscle !== undefined &&
      this.measure.muscle !== null &&
      this.measure.date !== undefined &&
      this.measure.date !== null
    ) {
      this.dialogRef.close(this.measure);
    } else {
      this.toastr.info('Invalid measure', 'Progress', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
