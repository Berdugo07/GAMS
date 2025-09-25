export interface docPropsProcurement {
  reference: string;
  sender?: officer;
  recipient?: officer;
  cite?: string;
  date: string;
}

interface officer {
  fullname: string;
  jobtitle: string;
}

interface item {
  code: string;
  name: string;
  ff: string;
  of: string;
  amount: number;
}

export interface procurement {
  _id: string;
  mode: string;
  aperturaProg: string;
  items: item[];
  type: string;
  descripcionAperturaProg: string;
  metodoAdjudicacion: string;
  formaAdjudicacion: string;
  price: string;
  deliveryTimeframe: string;
  deliveryLocation: string;
  warranty: string;
  reason: string;
  account: string;
  documents?: docPropsProcurement[];
  code: string;
  prefix: string;
  correlative: number;
  cite: string;
  institution: string;
  dependency: string;
  state: string;
  reference: string;
  numberOfDocuments: string;
  group: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  codigoProyecto: string;
  cuce: string;
  empreseAdjudicada: string;
  fechaApertura: string;
  precioAdjudicado: string;
  representanteLegal: string;
  tipoResolucion: string;
  certificacionPoa: string;
  certificacionPresupuestaria: string;
}
