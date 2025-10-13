import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Procedure } from 'src/modules/procedures/schemas';
import { WhatsAppBusinessService } from './whatsapp-business.service';
import { ObservationResult } from '../dtos/send-observation.dto';
import { SocketGateway } from '../gateways/socket.gateway';
import { Notification } from '../schemas/notification.schema';
import { ObservationNotification } from '../schemas/observation-notification.schema';
import { Role } from 'src/modules/users/schemas/role.schema'; // <-- modelo de roles

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Procedure.name) private readonly procedureModel: Model<Procedure>,
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    @InjectModel(ObservationNotification.name)
    private readonly observationNotificationModel: Model<ObservationNotification>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>, // <-- inyectar modelo de roles
    private readonly whatsappService: WhatsAppBusinessService,
    private readonly socketGateway: SocketGateway,
  ) {}

  private sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // ----------------------------
  // Log de procedimiento
  // ----------------------------
  async logProcedureDetails(procedureId: string): Promise<{ success: boolean; message: string; procedureCode?: string }> {
    try {
      this.logger.log(`Procesando notificación directa para trámite ${procedureId}`);
      const procedure = await this.procedureModel
        .findById(procedureId)
        .populate('applicant')
        .lean()
        .exec() as any;

      if (!procedure) {
        this.logger.warn(`Trámite ${procedureId} no existe`);
        return { success: false, message: 'Trámite no existe' };
      }

      const status = String(procedure.status || '').toLowerCase().trim();
      const group = String(procedure.group || '').toLowerCase().trim();
     const phone = procedure.applicant?.phone?.toString().trim();
const applicantType = procedure.applicant?.type?.toUpperCase().trim();

      if (status !== 'completed' || group !== 'externalprocedure' || applicantType !== 'NATURAL' || !phone || phone === '000000') {
        const reason = `Trámite ${procedure.code} no cumple criterios para notificación (status=${status}, group=${group}, type=${applicantType}, phone=${phone})`;
        this.logger.warn(reason);
        this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: false });
        return { success: false, message: reason };
      }

      const messageText = this.buildMessage(procedure);
      this.logger.log(`📤 Enviando WhatsApp a ${phone} para trámite ${procedure.code}`);

      const result = await this.whatsappService.sendMessage(phone, messageText);

      if (!result.success) {
        const errMsg = `Error enviando WhatsApp a ${phone}: ${JSON.stringify(result.error)}`;
        this.logger.error(errMsg);
        this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: false });
        return { success: false, message: errMsg };
      }

      this.logger.log(`WhatsApp enviado exitosamente a ${phone}`);
      this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: true });

      return { success: true, message: 'Notificación enviada correctamente', procedureCode: procedure.code };
    } catch (error: any) {
      this.logger.error(`Error procesando notificación: ${error?.message}`);
      this.socketGateway.emitWhatsAppNotification({ procedureId, success: false });
      return { success: false, message: error?.message || 'Error interno' };
    }
  }

  // ----------------------------
  // Enviar observaciones
  // ----------------------------
  async sendObservation(idsOrCodes: string[], observation: string, user: any): Promise<ObservationResult[]> {
    this.logger.log(`📨 Enviando observación a ${idsOrCodes.length} trámites`);

    // Recuperar role del usuario
    let roleName = 'Rol desconocido';
    if (user.role) {
      const roleDoc = await this.roleModel.findById(user.role).lean();
      if (roleDoc) roleName = roleDoc.name;
    }

    const results: ObservationResult[] = [];

    for (const value of idsOrCodes) {
      let procedure: any = null;

      if (Types.ObjectId.isValid(value)) {
        procedure = await this.procedureModel.findById(value).populate('applicant').lean().exec();
      }

      if (!procedure) {
        procedure = await this.procedureModel.findOne({ code: value }).populate('applicant').lean().exec();
      }

      if (!procedure) {
        results.push({ id: value, success: false, message: 'Trámite no existe' });
        continue;
      }

      const phone = procedure.applicant?.phone?.toString().trim();
      const applicantType = procedure.applicant?.type?.toUpperCase().trim();

      if (!phone || phone === '000000') {
        results.push({ id: value, success: false, message: 'Teléfono inválido' });
        continue;
      }

      if (!applicantType || applicantType !== 'NATURAL') {
        results.push({ id: value, success: false, message: 'Tipo de solicitante no válido' });
        continue;
      }

      const messageText =
        `*GOBIERNO AUTÓNOMO MUNICIPAL DE SACABA (GAMS)*\n` +
        `-----------------------------------\n` +
        `Código: ${procedure.code}\n` +
        `Referencia: ${procedure.reference || 'No registrada'}\n` +
        `Solicitante: ${(procedure.applicant?.firstname || '')} ${(procedure.applicant?.lastname || '')}\n` +
        `OBSERVACIÓN:\n${observation.toUpperCase()}\n\n` +
        `_Este mensaje fue generado automáticamente por el sistema de notificaciones del GAMS_`;

      try {
        const result = await this.whatsappService.sendMessage(phone, messageText);
        const roleDoc = await this.roleModel.findById(user.role).lean().exec();
        const roleName = roleDoc?.name || 'Rol desconocido';

        if (result.success) {
          await this.observationNotificationModel.create({
            procedureCode: procedure.code,
            observation,
            status: 'sent',
            phone,
            applicantName: `${procedure.applicant?.firstname || ''} ${procedure.applicant?.lastname || ''}`.trim(),
            senderName: `${user.fullname || 'Usuario desconocido'}`, // 👈 nombre + rol
            senderRole: roleName, // <-- nuevo campo
            messageId: result.messageId,
            createdAt: new Date(),
          });
        } else {
          this.logger.warn(`⚠️ Mensaje a ${procedure.code} falló, no se guardará`);
        }

        this.socketGateway.emitWhatsAppNotification({
          procedureId: procedure.code,
          success: result.success,
          message: result.success ? 'Mensaje enviado' : 'Error al enviar',
          phone,
        });

        results.push({
          id: value,
          success: result.success,
          message: result.success ? '✅ Observación enviada correctamente' : '❌ Error al enviar observación',
        });
      } catch (error: any) {
        this.logger.error(`Error enviando observación a ${procedure.code}: ${error.message}`);
        results.push({ id: value, success: false, message: error?.message || 'Error interno' });
      }
    }

    this.logger.log(`🏁 Envío de observaciones finalizado (${results.length} resultados)`);
    return results;
  }

  // ----------------------------
  // Construir mensaje
  // ----------------------------
  private buildMessage(procedure: any): string {
    const applicant = procedure.applicant || {};
    const nombreCompleto = `${applicant.firstname || ''} ${applicant.middlename || ''} ${applicant.lastname || ''}`.trim();

    return (
      `*GOBIERNO AUTÓNOMO MUNICIPAL DE SACABA (GAMS)*\n` +
      `-----------------------------------\n` +
      `Código: ${procedure.code}\n` +
      `Referencia: ${procedure.reference || 'No registrada'}\n` +
      `Solicitante: ${nombreCompleto || 'No registrado'}\n` +
      `Estado: ${procedure.state || procedure.status || 'No disponible'}\n\n` +
      `_Este mensaje fue generado automáticamente por el sistema de notificaciones del GAMS_`
    );
  }

  // ----------------------------
  // Verificar elegibilidad
  // ----------------------------
  isEligibleForNotification(procedure: any): boolean {
    try {
      const status = String(procedure?.status || '').toLowerCase().trim();
      const group = String(procedure?.group || '').toLowerCase().trim();
      const applicantType = String(procedure?.applicant?.type || '').toUpperCase().trim();
      const phone = String(procedure?.applicant?.phone || '').trim();

      return status === 'completed' && group === 'externalprocedure' && applicantType === 'NATURAL' && !!phone && phone !== '000000';
    } catch (error) {
      this.logger.error('Error verificando elegibilidad:', error);
      return false;
    }
  }
}
