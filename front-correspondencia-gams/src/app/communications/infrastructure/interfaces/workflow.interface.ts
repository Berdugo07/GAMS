export interface workflow {
  _id: string;
  sender: recipient;
  recipient: recipient;
  procedure: procedure;
  status: string;
  reference: string;
  attachmentsCount: string;
  internalNumber: string;
  sentDate: string;
  isOriginal: boolean;
  parentId?: string;
  receivedDate?: Date;
  actionLog?: actionLog;
  priority: number;
}

interface procedure {
  ref: string;
  code: string;
  group: string;
  reference: string;
}

interface recipient {
  account: string;
  institution: dependency;
  dependency: institution;
  fullname: string;
  jobtitle: string;
}

interface dependency {
  _id: string;
  nombre: string;
}

interface institution {
  _id: string;
  nombre: string;
}
interface actionLog {
  fullname: string;
  description: string;
  date: string;
}
