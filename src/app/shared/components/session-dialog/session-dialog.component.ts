import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { Exercise } from '../../../core/interfaces/exercise';
import { Session } from '../../../core/interfaces/session';

@Component({
  selector: 'app-session-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './session-dialog.component.html',
  styleUrl: './session-dialog.component.css',
})
export class SessionDialogComponent implements OnInit {
  session: Session = {} as Session;
  toastr = inject(ToastrService);

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
      title: 'Exercise ' + (this.session.exercises.length + 1),
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
    if (
      this.session.title &&
      this.session.exercises.every(
        (exercice) =>
          exercice.title && exercice.lastPerformance && exercice.repetitions
      )
    ) {
      this.dialogRef.close(this.session);
    } else {
      this.toastr.info('Invalid session', 'Session', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
