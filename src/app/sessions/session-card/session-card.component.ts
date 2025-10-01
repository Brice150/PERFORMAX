import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { Session } from '../../core/interfaces/session';

@Component({
  selector: 'app-session-card',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
  ],
  templateUrl: './session-card.component.html',
  styleUrl: './session-card.component.css',
})
export class SessionCardComponent {
  readonly session = input<Session>({} as Session);
}
