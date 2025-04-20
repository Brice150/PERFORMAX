import { Exercise } from './exercise';

export interface Workout {
  id?: string;
  title: string;
  exercises: Exercise[];
  userId?: string;
}
