import { Measure } from './measure';

export interface Progress {
  id: string;
  measures: Measure[];
  userId?: string;
}
