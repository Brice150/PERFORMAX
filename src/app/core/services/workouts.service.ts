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
import { UserService } from './user.service';
import { Workout } from '../interfaces/workout';

@Injectable({ providedIn: 'root' })
export class WorkoutsService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  workoutsCollection = collection(this.firestore, 'workouts');

  getWorkouts(): Observable<Workout[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const workoutsCollection = query(
      collection(this.firestore, 'workouts'),
      where('userId', '==', userId)
    );
    return collectionData(workoutsCollection, { idField: 'id' }) as Observable<
      Workout[]
    >;
  }

  getWorkout(workoutId: string): Observable<Workout | null> {
    const userId = this.userService.auth.currentUser?.uid;
    if (!userId) return of(null);

    const workoutsQuery = query(
      this.workoutsCollection,
      where('userId', '==', userId),
      where('id', '==', workoutId)
    );

    return collectionData(workoutsQuery, { idField: 'id' }).pipe(
      map((workouts) => (workouts.length > 0 ? workouts[0] : null))
    ) as Observable<Workout | null>;
  }

  addWorkout(workout: Workout): Observable<string> {
    const workoutsDoc = doc(this.workoutsCollection);
    workout.id = workoutsDoc.id;
    workout.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(workoutsDoc, { ...workout })).pipe(
      map(() => workout.id!)
    );
  }

  updateWorkout(workout: Workout): Observable<void> {
    if (!workout.id) {
      return from(Promise.reject('Workout ID missing'));
    }
    const workoutsDoc = doc(this.firestore, `workouts/${workout.id}`);
    return from(updateDoc(workoutsDoc, { ...workout }));
  }

  deleteWorkout(workoutId: string): Observable<void> {
    const workoutsDoc = doc(this.firestore, `workouts/${workoutId}`);
    return from(deleteDoc(workoutsDoc));
  }

  deleteUserWorkouts(): Observable<void> {
    const workoutsQuery = query(
      this.workoutsCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(workoutsQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((workout: any[]) => {
        if (workout.length === 0) {
          return of(undefined);
        }

        const deleteRequests = workout.map((workout: Workout) => {
          const workoutsDoc = doc(this.firestore, `workouts/${workout.id}`);
          return deleteDoc(workoutsDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
