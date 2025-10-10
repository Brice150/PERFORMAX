import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { Measure } from '../../core/interfaces/measure';

@Component({
  selector: 'app-measure-card',
  imports: [CommonModule],
  templateUrl: './measure-card.component.html',
  styleUrl: './measure-card.component.css',
})
export class MeasureCardComponent {
  readonly measure = input.required<Measure>();
  @Output() updateSessionEvent = new EventEmitter<void>();
  @Output() deleteSessionEvent = new EventEmitter<void>();

  update() {
    this.updateSessionEvent.emit();
  }

  delete(): void {
    this.deleteSessionEvent.emit();
  }
}
