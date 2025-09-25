export interface ProcedureProps {
  id: string;
  code: string;
  cite: string;
  numberOfDocuments: string;
  reference: string;
  account: string;
  group: procedureGroup;
  state: procedureState;
  createdAt: Date;
}

export interface OriginDetails {
  emitter: officer;
  receiver?: officer;
  phone?: string;
}

export enum procedureGroup {
  External = 'ExternalProcedure',
  Internal = 'InternalProcedure',
  Procurement = 'ProcurementProcedure',
}

export enum procedureState {
  Inscrito = 'INSCRITO',
  Observado = 'OBSERVADO',
  Revision = 'EN REVISION',
  Concluido = 'CONCLUIDO',
  Anulado = 'ANULADO',
  Suspendido = 'SUSPENDIDO',
  Retirado = 'RETIRADO',
  Abandono = 'ABANDONO',
}

interface officer {
  fullname: string;
  jobtitle?: string;
}

export interface originDetails {
  emitter: officer;
  receiver?: officer;
  phone?: string;
}

export abstract class Procedure {
  public readonly id: string;
  public readonly code: string;
  public readonly group: procedureGroup;
  public readonly createdAt: Date;
  public readonly account: string;
  public readonly completedAt?: Date;
  public state: procedureState;
  public cite: string;
  public reference: string;
  public numberOfDocuments: string;
  public isSend: boolean;

  constructor({
    id,
    code,
    cite,
    account,
    state,
    reference,
    numberOfDocuments,
    createdAt,
    group,
  }: ProcedureProps) {
    this.id = id;
    this.code = code;
    this.cite = cite;
    this.account = account;
    this.state = state;
    this.reference = reference;
    this.numberOfDocuments = numberOfDocuments;
    this.group = group;
    this.createdAt = createdAt;
    // if (endDate) this.endDate = new Date(endDate);
  }

  abstract originDetails(): OriginDetails;

  get citeCode() {
    return this.cite === '' ? 'S/C' : this.cite;
  }

  get isActionable(): boolean {
    return this.state === 'INSCRITO';
  }
}
