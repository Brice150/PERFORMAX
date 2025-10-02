import { Session } from './session';

export interface Program {
  id?: string;
  logo: string;
  title: string;
  date: Date;
  sessions: Session[];
  userId?: string;
}
