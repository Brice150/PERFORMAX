import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Program } from '../../core/interfaces/program';

@Component({
  selector: 'app-program-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './program-card.component.html',
  styleUrl: './program-card.component.css',
})
export class ProgramCardComponent {
  readonly program = input.required<Program>();
  @Output() deleteProgramEvent = new EventEmitter<void>();

  delete(): void {
    this.deleteProgramEvent.emit();
  }
}
