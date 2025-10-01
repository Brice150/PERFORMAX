import { Session } from './session';

export interface Program {
  id?: string;
  title: string;
  sessions: Session[];
  userId?: string;
}
