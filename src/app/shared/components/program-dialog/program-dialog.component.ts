import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Program } from '../../../core/interfaces/program';

@Component({
  selector: 'app-program-dialog',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './program-dialog.component.html',
  styleUrl: './program-dialog.component.css',
})
export class ProgramDialogComponent implements OnInit {
  program: Program = {} as Program;

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
    this.dialogRef.close(this.program);
  }
}
