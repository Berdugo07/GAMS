import { 
  Controller, 
  Get, 
  Body,
  Post, 
  Param, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { WhatsAppBusinessService } from '../services/whatsapp-business.service';
import { ObservationResult } from '../dtos/send-observation.dto';


@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly whatsappService: WhatsAppBusinessService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('status/:messageId')
  async getMessageStatus(@Param('messageId') messageId: string) {
    try {
      return await this.whatsappService.checkMessageStatus(messageId);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al consultar estado del mensaje',
          details: error.response?.data || error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
@Post('send-observation')
async sendObservation(@Body() body: any): Promise<ObservationResult[]> {
  console.log('📨 RECIBIENDO PETICIÓN sendObservation', {
    ids: body.ids,
    observation: body.observation,
    timestamp: new Date().toISOString()
  });
  
  try {
    const results = await this.notificationService.sendObservation(body.ids, body.observation);
    console.log('✅ RESULTADOS FINALES:', results);
    return results;
  } catch (error) {
    console.error('❌ ERROR EN CONTROLLER:', error);
    throw error;
  }
}
  @Post(':procedureId')
  async notifyProcedure(@Param('procedureId') procedureId: string) {
    try {
      return await this.notificationService.logProcedureDetails(procedureId);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al notificar el procedimiento',
          details: error.response?.data || error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
@Post('webhook')
async receiveWebhook(@Body() body: { procedureId: string; newState: string }) {
  console.log('🔄 WEBHOOK RECIBIDO:', body);
  
  if (body.newState !== 'EN REVISION') {
    console.log('📝 Ejecutando logProcedureDetails para:', body.procedureId);
    await this.notificationService.logProcedureDetails(body.procedureId);
  }
  return { success: true };
}



}
