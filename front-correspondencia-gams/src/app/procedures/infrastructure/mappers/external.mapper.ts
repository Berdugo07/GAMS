import {
  ExternalProcedure,
  procedureGroup,
  procedureState,
} from '../../domain';
import { external } from '../interfaces/external.interface';

export class ExternalMapper {
  static fromResponse({
    _id,
    group,
    state,
    type,
    createdAt,
    representative,
    ...props
  }: external): ExternalProcedure {
    return new ExternalProcedure({
      id: _id,
      type: type.nombre,
      createdAt: new Date(createdAt),
      group: group as procedureGroup,
      state: state as procedureState,
      ...(representative && {
        representative: representative,
      }),
      ...props,
    });
  }
}
