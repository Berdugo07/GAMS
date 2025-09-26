import { procedureGroup } from '../../../procedures/domain';

interface communicationProps {
  id: string;
  sender: worker;
  recipient: worker;
  procedure: procedureProps;
  reference: string;
  attachmentsCount: string;
  internalNumber: string;
  status: status;
  sentDate: Date;
  receivedDate?: Date;
  isOriginal: boolean;
  actionLog?: actionLog;
  remainingTime?: number;
  priority: number;
}
interface worker {
  account: string;
  fullname: string;
  jobtitle: string;
}

interface procedureProps {
  ref: string;
  code: string;
  group: procedureGroup;
  reference: string;
}
interface actionLog {
  fullname: string;
  description: string;
  date: string;
}

export enum sendStatus {
  Received = 'received',
  Completed = 'completed',
  Rejected = 'rejected',
  Pending = 'pending',
  Archived = 'archived',
  Forwarding = 'forwarding',
  AutoRejected = 'auto-rejected',
}

type status =
  | 'received'
  | 'completed'
  | 'rejected'
  | 'pending'
  | 'archived'
  | 'forwarding'
  | 'auto-rejected';

export class Communication implements communicationProps {
  readonly id: string;
  readonly sender: worker;
  readonly recipient: worker;
  readonly procedure: procedureProps;
  readonly reference: string;
  readonly attachmentsCount: string;
  readonly internalNumber: string;
  readonly sentDate: Date;
  status: status;
  receivedDate?: Date;
  isOriginal: boolean;
  actionLog?: actionLog;
  remainingTime?: number;
  priority: number;

  constructor({
    id,
    sender,
    recipient,
    procedure,
    reference,
    attachmentsCount,
    internalNumber,
    sentDate,
    receivedDate,
    actionLog,
    status,
    isOriginal,
    remainingTime,
    priority,
  }: communicationProps) {
    this.id = id;
    this.sender = sender;
    this.recipient = recipient;
    this.procedure = procedure;
    this.reference = reference;
    this.attachmentsCount = attachmentsCount;
    this.internalNumber = internalNumber;
    this.sentDate = sentDate;
    this.status = status;
    this.receivedDate = receivedDate;
    this.isOriginal = isOriginal;
    this.actionLog = actionLog;
    this.remainingTime = remainingTime;
    this.priority = priority;
  }

  public copyWith(modifyObject: Partial<communicationProps>): Communication {
    return Object.assign(Object.create(Communication.prototype), {
      ...this,
      ...modifyObject,
    });
  }

  get groupLabel(): string {
    const groups = {
      [procedureGroup.External]: 'Externo',
      [procedureGroup.Internal]: 'Interno',
      [procedureGroup.Procurement]: 'Contratacion',
    };
    return groups[this.procedure.group];
  }

  get documentLabel(): string {
    return this.isOriginal ? 'Original' : 'Copia';
  }

  get citeCode() {
    return this.internalNumber ? this.internalNumber : 'S/N';
  }
}