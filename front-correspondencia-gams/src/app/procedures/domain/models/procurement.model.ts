import { OriginDetails, Procedure, ProcedureProps } from './procedure.model';

export interface procurementDoc {
  reference: string;
  sender?: officer;
  recipient?: officer;
  via?: officer;
  cite?: string;
  date?: Date;
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

interface procurementProps extends ProcedureProps {
  mode: string;
  aperturaProg: string;
  items: item[];
  type: string;
  descripcionAperturaProg: string;
  metodoAdjudicacion: string;
  formaAdjudicacion: string;
  price: number;
  deliveryTimeframe: string;
  deliveryLocation: string;
  warranty: string;
  reason: string;
  documents: procurementDoc[];
  certificacionPresupuestaria: string;
  certificacionPoa: string;
  account: string;
  codigoProyecto: string;
  cuce: string;
  empreseAdjudicada: string;
  fechaApertura: string;
  precioAdjudicado: string;
  representanteLegal: string;
  tipoResolucion: string;
}

export class ProcurementProcedure extends Procedure {
  mode: string;
  aperturaProg: string;
  items: item[];
  type: string;
  descripcionAperturaProg: string;
  metodoAdjudicacion: string;
  formaAdjudicacion: string;
  price: number;
  deliveryTimeframe: string;
  deliveryLocation: string;
  warranty: string;
  reason: string;
  documents: procurementDoc[];
  certificacionPresupuestaria: string;
  certificacionPoa: string;
  codigoProyecto: string;
  cuce: string;
  empreseAdjudicada: string;
  fechaApertura: string;
  precioAdjudicado: string;
  representanteLegal: string;
  tipoResolucion: string;

  constructor({
    mode,
    aperturaProg,
    items,
    type,
    descripcionAperturaProg,
    metodoAdjudicacion,
    formaAdjudicacion,
    price,
    deliveryTimeframe,
    deliveryLocation,
    warranty,
    reason,
    documents,
    certificacionPresupuestaria,
    certificacionPoa,
    codigoProyecto,
    cuce,
    empreseAdjudicada,
    fechaApertura,
    precioAdjudicado,
    representanteLegal,
    tipoResolucion,
    ...procedureProps
  }: procurementProps) {
    super(procedureProps);
    this.mode = mode;
    this.aperturaProg = aperturaProg;
    this.items = items;
    this.type = type;
    this.descripcionAperturaProg = descripcionAperturaProg;
    this.metodoAdjudicacion = metodoAdjudicacion;
    this.formaAdjudicacion = formaAdjudicacion;
    this.price = price;
    this.deliveryTimeframe = deliveryTimeframe;
    this.deliveryLocation = deliveryLocation;
    this.warranty = warranty;
    this.reason = reason;
    this.documents = documents;
    this.certificacionPresupuestaria = certificacionPresupuestaria;
    this.certificacionPoa = certificacionPoa;
    this.codigoProyecto = codigoProyecto;
    this.cuce = cuce;
    this.empreseAdjudicada = empreseAdjudicada;
    this.fechaApertura = fechaApertura;
    this.precioAdjudicado = precioAdjudicado;
    this.representanteLegal = representanteLegal;
    this.tipoResolucion = tipoResolucion;
  }

  isPrintEnabled(index: number) {
    const document = this.documents[index];
    if (!document) return false;
    return (
      Object.values(document).every((value) => value) &&
      Object.keys(document).length > 5
    );
  }

  override originDetails(): OriginDetails {
    return {
      emitter: {
        fullname: '',
        jobtitle: '',
      },
    };
  }
}
