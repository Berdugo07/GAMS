export interface typeProcedure {
  _id: string;
  nombre: string;
  segmento: string;
  tipo: 'INTERNO' | 'EXTERNO';
  activo: boolean;
  requerimientos: requirement[];
}

export interface requirement {
  nombre: string;
  activo: boolean;
}
