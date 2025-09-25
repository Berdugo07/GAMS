import { ExternalProcedure, InternalProcedure } from '../../schemas';

type procedure = ExternalProcedure | InternalProcedure ;
export interface ValidProcedureService {
  getDetail(procedureId: string): Promise<procedure>;
}
