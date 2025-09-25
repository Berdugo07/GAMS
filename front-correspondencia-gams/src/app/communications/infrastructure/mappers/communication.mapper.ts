import type { procedureGroup } from '../../../procedures/domain';
import type { communication } from '../interfaces/communication.interface';
import { sendStatus, Communication } from '../../domain';

export class CommunicationMapper {
  static fromResponse(response: communication): Communication {
    return new Communication({
      id: response._id,
      sender: response.sender,
      recipient: response.recipient,
      procedure: {
        ref: response.procedure.ref,
        code: response.procedure.code,
        group: response.procedure.group as procedureGroup,
        reference: response.procedure.reference,
      },
      status: response.status as sendStatus,
      sentDate: new Date(response.sentDate),
      receivedDate: response.receivedDate
        ? new Date(response.receivedDate)
        : undefined,
      actionLog: response.actionLog,
      isOriginal: response.isOriginal,
      reference: response.reference,
      attachmentsCount: response.attachmentsCount,
      internalNumber: response.internalNumber,
      remainingTime: response.remainingTime,
      priority:response.priority
    });
  }
}
