import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgramsService } from '../core/services/programs.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-programs',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './programs.component.html',
  styleUrl: './programs.component.css',
})
export class ProgramsComponent implements OnInit {
  programsService = inject(ProgramsService);
  destroyed$ = new Subject<void>();
  loading: boolean = false;

  ngOnInit(): void {}
}
