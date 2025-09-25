export interface archive {
  _id: string;
  account: string;
  institution: string;
  dependency: string;
  communication: string;
  officer: officer;
  procedure: procedure;
  folder: string;
  description: string;
  isOriginal: boolean;
  createdAt: string;
  updatedAt: string;
  state: string;
}

interface officer {
  fullname: string;
  jobtitle: string;
}

interface procedure {
  ref: string;
  code: string;
  group: string;
  reference: string;
}
