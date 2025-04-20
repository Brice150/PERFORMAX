import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  combineLatest,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import { Progress } from '../interfaces/progress';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  progressCollection = collection(this.firestore, 'progress');

  getProgress(): Observable<Progress[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const progressCollection = query(
      collection(this.firestore, 'progress'),
      where('userId', '==', userId)
    );
    return collectionData(progressCollection, { idField: 'id' }) as Observable<
      Progress[]
    >;
  }

  addProgress(progress: Progress): Observable<string> {
    const progressDoc = doc(this.progressCollection);
    progress.id = progressDoc.id;
    progress.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(progressDoc, { ...progress })).pipe(
      map(() => progress.id)
    );
  }

  updateProgress(progress: Progress): Observable<void> {
    if (!progress.id) {
      return from(Promise.reject('Progress ID missing'));
    }
    const progressDoc = doc(this.firestore, `progress/${progress.id}`);
    return from(updateDoc(progressDoc, { ...progress }));
  }

  deleteProgress(progressId: string): Observable<void> {
    const progressDoc = doc(this.firestore, `progress/${progressId}`);
    return from(deleteDoc(progressDoc));
  }

  deleteUserProgress(): Observable<void> {
    const progressQuery = query(
      this.progressCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(progressQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((progress: any[]) => {
        if (progress.length === 0) {
          return of(undefined);
        }

        const deleteRequests = progress.map((progress: Progress) => {
          const progressDoc = doc(this.firestore, `progress/${progress.id}`);
          return deleteDoc(progressDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
