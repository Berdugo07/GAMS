import { procedureGroup } from '../../../procedures/domain';
import { Archive } from '../../domain/models/archive.model';
import { archive } from '../interfaces/archive.interface';

export class ArchiveMapper {
  static fromResponse({
    createdAt,
    updatedAt,
    procedure,
    _id,
    ...props
  }: archive): Archive {
    return new Archive({
      id: _id,
      procedure: {
        ref: procedure.ref,
        code: procedure.code,
        reference: procedure.reference,
        group: procedure.group as procedureGroup,
      },
      updatedAt: new Date(createdAt),
      createdAt: new Date(updatedAt),
      ...props,
    });
  }
}
