import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgressService } from '../core/services/progress.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-progress',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
})
export class ProgressComponent implements OnInit {
  progressService = inject(ProgressService);
  destroyed$ = new Subject<void>();
  loading: boolean = false;

  ngOnInit(): void {}
}
