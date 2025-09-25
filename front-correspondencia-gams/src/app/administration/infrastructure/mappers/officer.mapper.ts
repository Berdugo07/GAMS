import { Officer } from '../../domain';
import { officer } from '../interfaces/officer.interface';

export class OfficerMapper {
  static fromResponse(response: officer): Officer {
    return new Officer({
      id: response['_id'],
      nombre: response['nombre'],
      paterno: response['paterno'],
      materno: response['materno'],
      dni: response['dni']?.toString() ?? '',
      telefono: response['telefono'],
      activo: response['activo'],
    });
  }
}
