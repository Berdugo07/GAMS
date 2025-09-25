import { Account } from '../../domain/models/account.model';
import { account } from '../interfaces/account.interface';
import { OfficerMapper } from './officer.mapper';

export class AccountMapper {
  static fromResponse(response: account): Account {
    const { _id,officer, area, ...values } = response;
    return new Account({
      id:_id,
      ...values,
      ...(officer && { officer: OfficerMapper.fromResponse(officer) }),
      area: area ?? null,
    });
  }
}
