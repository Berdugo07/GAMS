import { Officer } from './officer.model';

interface AccountProps {
  id: string;
  officer?: Officer;
  isVisible: boolean;
  dependencia: dependency;
  user: user;
  jobtitle: string;
  area: number |null;
}

interface dependency {
  _id: string;
  nombre: string;
  codigo: string;
}

interface user {
  login: string;
  isActive: boolean;
  role: string;
}

export class Account {
  id: string;
  officer?: Officer;
  isVisible: boolean;
  dependencia: dependency;
  jobtitle: string;
  user: user;
  area:number|null
  constructor({
    id: _id,
    officer,
    isVisible,
    dependencia,
    jobtitle,
    user,
    area
  }: AccountProps) {
    this.id = _id;
    this.officer = officer;
    this.dependencia = dependencia;
    this.isVisible = isVisible;
    this.jobtitle = jobtitle;
    this.user = user;
    this.area=area
  }

  get fullnameManager(): string {
    return this.officer ? this.officer.fullName : 'SIN ASIGNAR';
  }
}
