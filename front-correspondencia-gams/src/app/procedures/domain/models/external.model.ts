import { OriginDetails, Procedure, ProcedureProps } from './procedure.model';

interface ExternalProps extends ProcedureProps {
  type: string;
  applicant: applicant;
  representative?: representative;
  requirements: string[];
  pin: number;
}

interface applicant {
  firstname: string;
  middlename?: string;
  lastname?: string;
  phone: string;
  dni?: string;
  type: 'NATURAL' | 'JURIDICO';
}

interface representative {
  firstname: string;
  middlename: string;
  lastname?: string;
  phone: string;
  dni: string;
}

export class ExternalProcedure extends Procedure implements ExternalProps {
  type: string;
  applicant: applicant;
  representative?: representative;
  requirements: string[];
  pin: number;

  constructor({
    applicant,
    representative,
    requirements,
    pin,
    type,
    ...procedureProps
  }: ExternalProps) {
    super(procedureProps);
    this.applicant = applicant;
    this.representative = representative;
    this.requirements = requirements;
    this.type = type;
    this.pin = pin;
  }

  get fullnameApplicant() {
    return [
      this.applicant.firstname,
      this.applicant.middlename,
      this.applicant.lastname,
    ]
      .filter((term) => term)
      .join(' ');
  }

  get fullnameRepresentative() {
    return this.representative
      ? [
          this.representative.firstname,
          this.representative.middlename,
          this.representative.lastname,
        ]
          .filter((term) => term)
          .join(' ')
      : 'Sin representante';
  }

  public copyWith(modifyObject: {
    [P in keyof this]?: this[P];
  }): ExternalProcedure {
    return Object.assign(Object.create(ExternalProcedure.prototype), {
      ...this,
      ...modifyObject,
    });
  }

  override originDetails(): OriginDetails {
    return {
      emitter: {
        fullname: this.fullnameApplicant,
        jobtitle: `P. ${this.applicant.type}`,
      },
      phone: this.applicant.phone,
    };
  }
}
