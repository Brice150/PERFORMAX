import { Program } from './program';

export interface Programs {
  id: string;
  programs: Program[];
  userId?: string;
}
