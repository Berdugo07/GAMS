import { Procedure, ProcedureProps } from './procedure.model';

interface internalProps extends ProcedureProps {
  sender: worker;
  recipient: worker;
}

interface worker {
  fullname: string;
  jobtitle: string;
}

export class InternalProcedure extends Procedure implements internalProps {
  sender: worker;
  recipient: worker;

  constructor({ sender, recipient, ...procedureProps }: internalProps) {
    super(procedureProps);
    this.sender = sender;
    this.recipient = recipient;
  }

  override originDetails() {
    return {
      emitter: {
        fullname: this.sender.fullname,
        jobtitle: this.sender.jobtitle,
      },
      receiver: {
        fullname: this.recipient.fullname,
        jobtitle: this.recipient.jobtitle,
      },
    };
  }
}
