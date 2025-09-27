import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { User } from '../../core/interfaces/user';

@Component({
  selector: 'app-security',
  imports: [CommonModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css',
})
export class SecurityComponent {
  readonly user = input.required<User>();
  @Output() updateEvent = new EventEmitter<void>();

  update(): void {
    this.updateEvent.emit();
  }
}
