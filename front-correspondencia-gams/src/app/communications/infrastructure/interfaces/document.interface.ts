export interface doc {
  _id: string;
  account: string;
  dependecy: string;
  type: string;
  segment: string;
  correlative: number;
  cite: string;
  reference: string;
  sender: recipient;
  recipient: recipient;
  via?: recipient;
  createdAt: string;
  updatedAt: string;
  procedure?: procedure;
}

interface recipient {
  fullname: string;
  jobtitle: string;
}
interface procedure {
  code: string;
  group: string;
}
