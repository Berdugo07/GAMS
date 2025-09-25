import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { procedureGroup } from '../schemas';

import { ExternalService } from './external.service';
import { InternalService } from './internal.service';

import { ValidProcedureService } from '../domain';

@Injectable()
export class ProcedureFactoryService {
  constructor(private externalService: ExternalService, private internalService: InternalService) {}

  getService(group: procedureGroup): ValidProcedureService {
    switch (group) {
      case procedureGroup.EXTERNAL:
        return this.externalService;
      case procedureGroup.INTERNAL:
        return this.internalService;

      default:
        throw new InternalServerErrorException(`Group ${group} is not defined`);
    }
  }
}
