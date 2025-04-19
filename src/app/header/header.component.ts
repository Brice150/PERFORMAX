import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  router = inject(Router);
  location = inject(Location);
  toastr = inject(ToastrService);
  @Output() logoutEvent = new EventEmitter<void>();

  logout(): void {
    this.logoutEvent.emit();
    this.toastr.info('Logged out', 'Performax', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }
}
