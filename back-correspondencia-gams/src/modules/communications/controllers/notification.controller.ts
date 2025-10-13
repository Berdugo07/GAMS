import { 
  Controller, 
  Get, 
  Body,
  Post, 
  Param, 
  Req,
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from '../services/notification.service';
import { WhatsAppBusinessService } from '../services/whatsapp-business.service';
import { ObservationNotification } from '../schemas/observation-notification.schema';
import { Procedure } from 'src/modules/procedures/schemas'; 
import { GetUserRequest } from 'src/modules/auth/decorators';
import { Account } from 'src/modules/administration/schemas';
import { Request } from 'express';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly whatsappService: WhatsAppBusinessService,
    private readonly notificationService: NotificationService,
    @InjectModel(ObservationNotification.name)
    private readonly observationNotificationModel: Model<ObservationNotification>,
    @InjectModel(Procedure.name)
  private readonly procedureModel: Model<Procedure>, 
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
async sendObservation(
  @Body() dto: { ids: string[]; observation: string },
  @Req() req: Request, // 👈 decorador que te da el usuario logueado
) {
  const user = (req as any).user;
  console.log('📨 Enviando observación como:', user.fullname);

  try {
    const results = await this.notificationService.sendObservation(
      dto.ids,
      dto.observation,
      user, // 👈 ahora pasamos el usuario con fullname
    );

    return { success: true, results };
  } catch (error) {
    console.error('❌ ERROR EN CONTROLLER:', error);
    throw new HttpException(
      {
        success: false,
        message: 'Error enviando observación',
        details: error?.message || error,
      },
      400,
    );
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
 @Get('history/:procedureCode')
  async getHistory(@Param('procedureCode') code: string) {
    try {
      const filter = { procedureCode: code };

      // 🔹 Traer TODOS los mensajes (sin límite ni paginación)
      const obs = await this.observationNotificationModel
        .find(filter)
        .sort({ createdAt: 1 }) // más antiguos primero
        .lean()
        .exec();

      const procedure = await this.procedureModel
        .findOne({ code })
        .populate('applicant')
        .lean<{ applicant?: { firstname?: string; lastname?: string } }>()
        .exec();

      const applicantName = `${procedure?.applicant?.firstname || ''} ${
        procedure?.applicant?.lastname || ''
      }`.trim();

      const all = obs.map((o) => ({
        ...o,
        applicantName,
      }));

      return { items: all, total: all.length };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener historial de notificaciones',
          details: error?.message || error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}