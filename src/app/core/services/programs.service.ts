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
import { Program } from '../interfaces/program';

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  programsCollection = collection(this.firestore, 'programs');

  getPrograms(): Observable<Program[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const programsCollection = query(
      collection(this.firestore, 'programs'),
      where('userId', '==', userId)
    );
    return collectionData(programsCollection, { idField: 'id' }) as Observable<
      Program[]
    >;
  }

  getProgram(programId: string): Observable<Program | null> {
    const userId = this.userService.auth.currentUser?.uid;
    if (!userId) return of(null);

    const programsQuery = query(
      this.programsCollection,
      where('userId', '==', userId),
      where('id', '==', programId)
    );

    return collectionData(programsQuery, { idField: 'id' }).pipe(
      map((programs) => (programs.length > 0 ? programs[0] : null))
    ) as Observable<Program | null>;
  }

  addProgram(program: Program): Observable<string> {
    const programsDoc = doc(this.programsCollection);
    program.id = programsDoc.id;
    program.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(programsDoc, { ...program })).pipe(
      map(() => program.id!)
    );
  }

  updateProgram(program: Program): Observable<void> {
    if (!program.id) {
      return from(Promise.reject('Program ID missing'));
    }
    const programsDoc = doc(this.firestore, `programs/${program.id}`);
    return from(updateDoc(programsDoc, { ...program }));
  }

  deleteProgram(programId: string): Observable<void> {
    const programsDoc = doc(this.firestore, `programs/${programId}`);
    return from(deleteDoc(programsDoc));
  }

  deleteUserPrograms(): Observable<void> {
    const programsQuery = query(
      this.programsCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(programsQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((program: any[]) => {
        if (program.length === 0) {
          return of(undefined);
        }

        const deleteRequests = program.map((program: Program) => {
          const programsDoc = doc(this.firestore, `programs/${program.id}`);
          return deleteDoc(programsDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
