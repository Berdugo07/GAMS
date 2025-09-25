interface OfficerProps {
  id: string;
  nombre: string;
  paterno: string;
  materno: string;
  dni: string;
  telefono: number;
  activo: boolean;
}

export class Officer {
  public id: string;
  public nombre: string;
  public paterno: string;
  public materno: string;
  public dni: string;
  public telefono: number;
  public activo: boolean;

  constructor({
    id: _id,
    nombre,
    paterno,
    materno,
    dni,
    telefono,
    activo,
  }: OfficerProps) {
    this.id = _id;
    this.nombre = nombre;
    this.paterno = paterno;
    this.materno = materno;
    this.dni = dni;
    this.telefono = telefono;
    this.activo = activo;
  }

  get fullName() {
    return `${this.nombre} ${this.paterno} ${this.materno}`;
  }
}
