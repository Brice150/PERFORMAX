import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Session } from '../../core/interfaces/session';

@Component({
  selector: 'app-session-card',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './session-card.component.html',
  styleUrl: './session-card.component.css',
})
export class SessionCardComponent {
  readonly session = input.required<Session>();
  readonly logo = input.required<string>();
  @Output() updateSessionEvent = new EventEmitter<void>();
  @Output() deleteSessionEvent = new EventEmitter<void>();

  update() {
    this.updateSessionEvent.emit();
  }

  delete(): void {
    this.deleteSessionEvent.emit();
  }
}
