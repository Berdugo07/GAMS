import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';

@Injectable()
export class ProcedureListener {
  private readonly logger = new Logger(ProcedureListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('procedure.updated')
  async handleProcedureUpdate(payload: { procedureId: string }) {
    this.logger.log(`Evento recibido para procedimiento: ${payload.procedureId}`);
    try {
      await this.notificationService.logProcedureDetails(payload.procedureId);
    } catch (error: any) {
      this.logger.error(`Error enviando notificación: ${error.message}`);
    }
  }
}
