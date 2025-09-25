import { user } from '../../../users/infrastructure';
import { dependency } from './dependency.interface';
import { officer } from './officer.interface';

export interface account {
  _id: string;
  dependencia: dependency;
  officer?: officer;
  jobtitle: string;
  isVisible: boolean;
  user: user;
  area?: number;
}
