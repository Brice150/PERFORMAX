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
import { Programs } from '../interfaces/programs';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  programsCollection = collection(this.firestore, 'programs');

  getPrograms(): Observable<Programs[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const programsCollection = query(
      collection(this.firestore, 'programs'),
      where('userId', '==', userId)
    );
    return collectionData(programsCollection, { idField: 'id' }) as Observable<
      Programs[]
    >;
  }

  addPrograms(programs: Programs): Observable<string> {
    const programsDoc = doc(this.programsCollection);
    programs.id = programsDoc.id;
    programs.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(programsDoc, { ...programs })).pipe(
      map(() => programs.id)
    );
  }

  updatePrograms(programs: Programs): Observable<void> {
    if (!programs.id) {
      return from(Promise.reject('Programs ID missing'));
    }
    const programsDoc = doc(this.firestore, `programs/${programs.id}`);
    return from(updateDoc(programsDoc, { ...programs }));
  }

  deletePrograms(programsId: string): Observable<void> {
    const programsDoc = doc(this.firestore, `programs/${programsId}`);
    return from(deleteDoc(programsDoc));
  }

  deleteUserPrograms(): Observable<void> {
    const programsQuery = query(
      this.programsCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(programsQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((programs: any[]) => {
        if (programs.length === 0) {
          return of(undefined);
        }

        const deleteRequests = programs.map((programs: Programs) => {
          const programsDoc = doc(this.firestore, `programs/${programs.id}`);
          return deleteDoc(programsDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
