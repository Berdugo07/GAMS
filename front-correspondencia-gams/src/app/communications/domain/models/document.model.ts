interface docProps {
  id: string;
  account: string;
  dependecy: string;
  type: string;
  segment: string;
  correlative: number;
  cite: string;
  reference: string;
  sender: recipientProps;
  recipient: recipientProps;
  via?: recipientProps;
  createdAt: Date;
  updatedAt: Date;
  procedure?: procedureProps;
}

interface recipientProps {
  fullname: string;
  jobtitle: string;
}
interface procedureProps {
  code: string;
  group: string;
}

export class Doc implements docProps {
  id: string;
  type: string;
  cite: string;
  segment: string;
  account: string;
  dependecy: string;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
  correlative: number;
  sender: recipientProps;
  recipient: recipientProps;
  via?: recipientProps;
  procedure?: procedureProps;

  constructor({
    id,
    account,
    dependecy,
    type,
    segment,
    correlative,
    cite,
    reference,
    sender,
    recipient,
    via,
    createdAt,
    updatedAt,
    procedure,
  }: docProps) {
    this.id = id;
    this.account = account;
    this.dependecy = dependecy;
    this.type = type;
    this.segment = segment;
    this.correlative = correlative;
    this.cite = cite;
    this.reference = reference;
    this.sender = sender;
    this.recipient = recipient;
    this.via = via;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.procedure = procedure;
  }

  get title(): string {
    switch (this.type) {
      case 'CI':
        return 'COMUNICACION INTERNA';
      case 'CE':
        return 'COMUNICACION EXTERNA';
      case 'CIR':
        return 'CIRCULAR';
      case 'MEM':
        return 'MEMORANDUM';

      default:
        return 'DESCONOCIDO';
    }
  }
}
