import { inject, Injectable } from '@angular/core';
import { deleteUser, updatePassword } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  userService = inject(UserService);

  updateProfile(user: User): Observable<void> {
    const currentUser = this.userService.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('User not logged in'));
    }

    if (!user.password) {
      return from(Promise.reject('Empty password'));
    }

    const promise = updatePassword(currentUser, user.password).then(() => {
      this.userService.currentUserSig.set({
        email: user.email,
      });
    });

    return from(promise);
  }

  deleteProfile(): Observable<void> {
    const currentUser = this.userService.auth.currentUser;

    if (!currentUser) {
      return from(Promise.reject('User not logged in'));
    }

    const promise = deleteUser(currentUser);

    return from(promise);
  }
}
