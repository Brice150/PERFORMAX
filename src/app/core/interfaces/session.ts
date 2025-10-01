import { Exercise } from './exercise';

export interface Session {
  id?: string;
  title: string;
  exercises: Exercise[];
  userId?: string;
}
