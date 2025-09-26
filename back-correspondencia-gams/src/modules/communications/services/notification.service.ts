// src/modules/communications/services/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Procedure } from 'src/modules/procedures/schemas';
import { WhatsAppBusinessService } from './whatsapp-business.service';
import { ObservationResult } from '../dtos/send-observation.dto';
import { SocketGateway } from '../gateways/socket.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Procedure.name) private readonly procedureModel: Model<Procedure>,
    private readonly whatsappService: WhatsAppBusinessService,
    private readonly socketGateway: SocketGateway,
  ) {}

  private sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Envía la notificación de WhatsApp directamente para un trámite (sin reintentos).
   * Retorna un objeto con success y message (y procedureCode si aplica).
   */
  async logProcedureDetails(
    procedureId: string,
  ): Promise<{ success: boolean; message: string; procedureCode?: string }> {
    try {
      this.logger.log(`🔔 Procesando notificación directa para trámite ${procedureId}`);

      const procedure = await this.procedureModel
        .findById(procedureId)
        .populate('applicant')
        .lean()
        .exec();

      if (!procedure) {
        this.logger.warn(`Trámite ${procedureId} no existe`);
        return { success: false, message: 'Trámite no existe' };
      }

      // Normalizamos y leemos campos relevantes
      const status = String((procedure as any).status || '').toLowerCase().trim();
      const group = String((procedure as any).group || '').toLowerCase().trim();
      const applicantType = String((procedure as any).applicant?.type || '').toUpperCase().trim();
      const phone = (procedure as any).applicant?.phone?.toString().trim() || '';

      // Validaciones: debe ser completed, externo, natural y tener teléfono válido
    if (
  status !== 'completed' ||
  group !== 'externalprocedure' ||
  applicantType !== 'NATURAL' ||
  !phone ||
  phone === '000000'
) {
  const reason = `Trámite ${procedure.code} no cumple criterios para notificación (status=${status}, group=${group}, type=${applicantType}, phone=${phone})`;
  this.logger.warn(reason);

  // 🔴 Emitir fallo por socket
  try {
    this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: false });
  } catch (emitErr) {
    this.logger.warn('No se pudo emitir evento por socket: ' + (emitErr as any).message);
  }

  return { success: false, message: reason };
}

      // Construir mensaje
      const messageText = this.buildMessage(procedure);

      // Enviar
      this.logger.log(`📤 Enviando WhatsApp a ${phone} para trámite ${procedure.code}`);
      const result = await this.whatsappService.sendMessage(phone, messageText);

      if (!result.success) {
        const errMsg = `Error enviando WhatsApp a ${phone}: ${JSON.stringify(result.error)}`;
        this.logger.error(errMsg);
        this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: false });
        return { success: false, message: errMsg };
      }

      this.logger.log(`✅ WhatsApp enviado exitosamente a ${phone} (messageId=${result.messageId || 'unknown'})`);
      this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: true });

      return { success: true, message: 'Notificación enviada correctamente', procedureCode: procedure.code };
    } catch (error: any) {
      this.logger.error(`❌ Error procesando notificación para ${procedureId}: ${error?.message || error}`);
      try {
        this.socketGateway.emitWhatsAppNotification({ procedureId: procedureId, success: false });
      } catch (emitErr) {
        this.logger.warn('No se pudo emitir evento por socket: ' + (emitErr as any).message);
      }
      return { success: false, message: `Error interno: ${error?.message || error}` };
    }
  }

  /**
   * Envia una observación a una lista de trámites (bulk).
   * Devuelve un array con resultados por id.
   */
  async sendObservation(ids: string[], observation: string): Promise<ObservationResult[]> {
    this.logger.log(`📢 Enviando observación a ${ids.length} trámites`);

    // pequeña espera opcional para suavizar (comportamiento previo)
    await this.sleep(500);

    const validIds = ids.filter((id) => isValidObjectId(id));
    const invalidIds = ids.filter((id) => !isValidObjectId(id));

    const results: ObservationResult[] = [];

    // IDs inválidos
    for (const id of invalidIds) {
      results.push({ id, success: false, message: 'ID inválido' });
    }

    if (!validIds.length) {
      this.logger.log('🔎 No hay ids válidos para procesar');
      return results;
    }

    for (const id of validIds) {
      try {
        const procedure = await this.procedureModel
          .findById(id)
          .populate('applicant')
          .lean()
          .exec();

        if (!procedure) {
          results.push({ id, success: false, message: 'Trámite no existe' });
          continue;
        }

        const phone = (procedure as any).applicant?.phone?.toString().trim();
        if (!phone || phone === '000000') {
          results.push({ id, success: false, message: 'Teléfono inválido' });
          continue;
        }

        const messageText = `Código: ${procedure.code}\nReferencia: ${procedure.reference}\nSolicitante: ${(procedure as any).applicant?.firstname || ''} ${(procedure as any).applicant?.lastname || ''}\nObservación: ${observation}`;

        this.logger.log(`📤 Enviando observación a ${phone} (trámite ${procedure.code})`);
        const result = await this.whatsappService.sendMessage(phone, messageText);

        if (result.success) {
          results.push({ id, success: true, message: 'Observación enviada correctamente' });
          this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: true });
        } else {
          results.push({ id, success: false, message: 'Error al enviar observación' });
          this.socketGateway.emitWhatsAppNotification({ procedureId: procedure.code, success: false });
        }
      } catch (error: any) {
        this.logger.error(`❌ Error enviando observación al id ${id}: ${error?.message || error}`);
        results.push({ id, success: false, message: error?.message || 'Error interno' });
      }
    }

    this.logger.log(`🏁 Envío de observaciones finalizado (${results.length} resultados)`);
    return results;
  }

  /**
   * Construye el mensaje estándar que será enviado por WhatsApp.
   * Puedes ajustarlo para añadir description desde archives si lo pasas como argumento.
   */
  private buildMessage(procedure: any): string {
  const applicant = procedure.applicant || {};
  const nombreCompleto = `${applicant.firstname || ''} ${applicant.middlename || ''} ${applicant.lastname || ''}`.trim();

  return (
    `*GOBIERNO AUTÓNOMO MUNICIPAL DE SACABA (GAMS)*\n` +
    `-----------------------------------\n` +
    `Código:* ${procedure.code}\n` +
    `Referencia:* ${procedure.reference || 'No registrada'}\n` +
    `Solicitante:* ${nombreCompleto || 'No registrado'}\n` +
    `Estado:* ${procedure.state || procedure.status || 'No disponible'}\n\n` +
    `_Este mensaje fue generado automáticamente por el sistema de notificaciones del GAMS_`
  );
}


  /**
   * Verifica elegibilidad (método utilitario).
   */
  isEligibleForNotification(procedure: any): boolean {
    try {
      const status = String(procedure?.status || '').toLowerCase().trim();
      const group = String(procedure?.group || '').toLowerCase().trim();
      const applicantType = String(procedure?.applicant?.type || '').toUpperCase().trim();
      const phone = String(procedure?.applicant?.phone || '').trim();

      return (
        status === 'completed' &&
        group === 'externalprocedure' &&
        applicantType === 'NATURAL' &&
        !!phone &&
        phone !== '000000'
      );
    } catch (error) {
      this.logger.error('Error verificando elegibilidad:', error);
      return false;
    }
  }
}