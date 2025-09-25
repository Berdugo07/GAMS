import { procedureGroup } from '../../../procedures/domain';

interface archiveProps {
  id: string;
  account: string;
  institution: string;
  dependency: string;
  communication: string;
  officer: officer;
  procedure: procedure;
  folder: string;
  description: string;
  isOriginal: boolean;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

interface officer {
  fullname: string;
  jobtitle: string;
}

interface procedure {
  ref: string;
  code: string;
  group: procedureGroup;
  reference: string;
}

export class Archive implements archiveProps {
  id: string;
  account: string;
  institution: string;
  dependency: string;
  communication: string;
  officer: officer;
  procedure: procedure;
  folder: string;
  description: string;
  isOriginal: boolean;
  state: string;
  updatedAt: Date;
  createdAt: Date;

  constructor({
    id,
    account,
    institution,
    dependency,
    communication,
    officer,
    procedure,
    folder,
    description,
    isOriginal,
    createdAt,
    updatedAt,
    state,
  }: archiveProps) {
    this.id = id;
    this.account = account;
    this.institution = institution;
    this.dependency = dependency;
    this.communication = communication;
    this.officer = officer;
    this.procedure = procedure;
    this.folder = folder;
    this.description = description;
    this.isOriginal = isOriginal;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.state = state;
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
}
