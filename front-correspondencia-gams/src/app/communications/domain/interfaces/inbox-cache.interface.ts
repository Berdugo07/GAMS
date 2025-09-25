import {
  sendStatus,
  Communication,
} from '../models/communication.model';

export interface inboxCache {
  datasource: Communication[];
  datasize: number;
  index: number;
  limit: number;
  form: Object;
  term: string;
  status: sendStatus | 'all';
}
