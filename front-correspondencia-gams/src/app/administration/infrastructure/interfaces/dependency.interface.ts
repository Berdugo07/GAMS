import { institution } from './institution.interface';

export interface area {
  name: string;
  code: number;
}
export interface dependency {
  _id: string;
  nombre: string;
  codigo: string;
  institucion: institution;
  areas?: area[];
}
