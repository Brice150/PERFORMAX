import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Exercise } from '../../../core/interfaces/exercise';
import { Session } from '../../../core/interfaces/session';

@Component({
  selector: 'app-session-dialog',
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
  templateUrl: './session-dialog.component.html',
  styleUrl: './session-dialog.component.css',
})
export class SessionDialogComponent implements OnInit {
  session: Session = {} as Session;
  fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<SessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Session
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.session = this.data;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.session.exercises,
      event.previousIndex,
      event.currentIndex
    );
  }

  addExercise(): void {
    const exercise: Exercise = {
      title: 'Exercise 1',
      repetitions: '4x10',
      lastPerformance: '20 kg',
    };

    this.session.exercises.push(exercise);
  }

  deleteExercise(index: number): void {
    this.session.exercises.splice(index, 1);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(this.session);
  }
}
