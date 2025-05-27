import {User} from './user.model';

export interface Credit {
  creditId: number;
  amount: number;
  type: string;
  createdAt: string;
  userId: number;
  userName: string;
}
