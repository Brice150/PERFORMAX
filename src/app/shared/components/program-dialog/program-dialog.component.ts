import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { logos } from '../../../../assets/data/logos';
import { Program } from '../../../core/interfaces/program';

@Component({
  selector: 'app-program-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './program-dialog.component.html',
  styleUrl: './program-dialog.component.css',
})
export class ProgramDialogComponent implements OnInit {
  program: Program = {} as Program;
  logos = logos;
  toastr = inject(ToastrService);

  constructor(
    public dialogRef: MatDialogRef<ProgramDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Program
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.program = this.data;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (this.program.title && this.program.logo) {
      this.dialogRef.close(this.program);
    } else {
      this.toastr.info('Invalid program', 'Program', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
