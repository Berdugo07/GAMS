import { 
  Controller, 
  Get, 
  Body,
  Post, 
  Param, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from '../services/notification.service';
import { WhatsAppBusinessService } from '../services/whatsapp-business.service';
import { ObservationResult } from '../dtos/send-observation.dto';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { ObservationNotification } from '../schemas/observation-notification.schema';
import { Procedure } from 'src/modules/procedures/schemas'; 
import { Query } from '@nestjs/common';

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
  async sendObservation(@Body() dto: CreateNotificationDto): Promise<ObservationResult[]> {
    console.log('📨 RECIBIENDO PETICIÓN sendObservation', {
      ids: dto.ids,
      observation: dto.observation,
      timestamp: new Date().toISOString()
    });
    
    try {
      const results = await this.notificationService.sendObservation(dto.ids, dto.observation);
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
@Get('history/:procedureCode')
async getHistory(
  @Param('procedureCode') code: string,
  @Query('date') date?: string,  
  @Query('page') page = 1,
  @Query('limit') limit = 4,
) {
  try {
    const filter: any = { procedureCode: code };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const [obs, total] = await Promise.all([
      this.observationNotificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean()
        .exec(),
      this.observationNotificationModel.countDocuments(filter),
    ]);

        const procedure = await this.procedureModel
        .findOne({ code })
        .populate('applicant')
        .lean<{
          applicant?: { firstname?: string; lastname?: string };
          notifications?: { observation: string; status: string; createdAt: Date }[];
        }>()
        .exec();


    const procNotifications =
      procedure?.notifications?.map((n) => ({
        procedureCode: code,
        observation: n.observation,
        status: n.status,
        createdAt: n.createdAt,
        applicantName: `${procedure?.applicant?.firstname || ''} ${procedure?.applicant?.lastname || ''}`.trim(),
      })) || [];

    const all = [...obs, ...procNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      items: all,
      total,
      page: +page,
      limit: +limit,
    };
  } catch (error) {
    throw new HttpException(
      {
        success: false,
        message: 'Error al obtener historial de notificaciones',
        details: error.response?.data || error.message,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

}