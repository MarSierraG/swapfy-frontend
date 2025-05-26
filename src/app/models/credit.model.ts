import {User} from './user.model';

export interface Credit {
  creditId: number;
  user: User;
  amount: number;
  type: string;
  createdAt: string;
}
