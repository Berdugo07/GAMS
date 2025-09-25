import { Doc } from '../../domain';
import { doc } from '../interfaces/document.interface';

export class DocMapper {
  static fromResponse(response: doc): Doc {
    return new Doc({
      id: response._id,
      type: response.type,
      cite: response.cite,
      segment: response.segment,
      procedure: response.procedure,
      account: response.account,
      dependecy: response.dependecy,
      reference: response.reference,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      correlative: response.correlative,
      recipient: response.recipient,
      sender: response.sender,
      via: response.via,
    });
  }
}
