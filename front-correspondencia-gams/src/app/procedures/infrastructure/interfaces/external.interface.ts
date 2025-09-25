export interface external {
  _id: string;
  applicant: applicant;
  representative?: representative;
  requirements: string[];
  pin: number;
  code: string;
  cite: string;
  type: type;
  account: string;
  state: string;
  reference: string;
  numberOfDocuments: string;
  send: boolean;
  group: string;
  createdAt: string;
  updatedAt: string;
  isSend: boolean;
}

interface applicant {
  firstname: string;
  middlename: string;
  lastname: string;
  phone: string;
  dni: string;
  type: 'NATURAL' | 'JURIDICO';
}

interface representative {
  firstname: string;
  middlename: string;
  lastname: string;
  phone: string;
  dni: string;
}

interface type {
  _id: string;
  nombre: string;
}
