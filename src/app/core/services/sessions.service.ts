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
import { Session } from '../interfaces/session';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  sessionsCollection = collection(this.firestore, 'sessions');

  getSessions(): Observable<Session[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const sessionsCollection = query(
      collection(this.firestore, 'sessions'),
      where('userId', '==', userId)
    );
    return collectionData(sessionsCollection, { idField: 'id' }) as Observable<
      Session[]
    >;
  }

  getSession(sessionId: string): Observable<Session | null> {
    const userId = this.userService.auth.currentUser?.uid;
    if (!userId) return of(null);

    const sessionsQuery = query(
      this.sessionsCollection,
      where('userId', '==', userId),
      where('id', '==', sessionId)
    );

    return collectionData(sessionsQuery, { idField: 'id' }).pipe(
      map((sessions) => (sessions.length > 0 ? sessions[0] : null))
    ) as Observable<Session | null>;
  }

  addSession(session: Session): Observable<string> {
    const sessionsDoc = doc(this.sessionsCollection);
    session.id = sessionsDoc.id;
    session.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(sessionsDoc, { ...session })).pipe(
      map(() => session.id!)
    );
  }

  updateSession(session: Session): Observable<void> {
    if (!session.id) {
      return from(Promise.reject('Session ID missing'));
    }
    const sessionsDoc = doc(this.firestore, `sessions/${session.id}`);
    return from(updateDoc(sessionsDoc, { ...session }));
  }

  deleteSession(sessionId: string): Observable<void> {
    const sessionsDoc = doc(this.firestore, `sessions/${sessionId}`);
    return from(deleteDoc(sessionsDoc));
  }

  deleteUserSessions(): Observable<void> {
    const sessionsQuery = query(
      this.sessionsCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(sessionsQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((session: any[]) => {
        if (session.length === 0) {
          return of(undefined);
        }

        const deleteRequests = session.map((session: Session) => {
          const sessionsDoc = doc(this.firestore, `sessions/${session.id}`);
          return deleteDoc(sessionsDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
