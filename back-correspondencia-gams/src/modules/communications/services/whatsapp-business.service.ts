import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: any; 
}

@Injectable()
export class WhatsAppBusinessService {
  private readonly logger = new Logger(WhatsAppBusinessService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';
  private accessToken: string;
  private phoneNumberId: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.accessToken = this.configService.get<string>('WHATSAPP_BUSINESS_TOKEN');
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
  }

  async sendMessage(phone: string, message: string): Promise<WhatsAppSendResult> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);

      if (!this.accessToken || this.accessToken === 'TEST_MODE') {
        this.logger.log('Modo simulación: WhatsApp enviado');
        return { success: true, messageId: 'simulated-message-id' };
      }

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: { body: message },
      };

      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const responseData = response.data as any;
      const messageId = responseData.messages[0].id;

      this.logger.log(`WhatsApp enviado. ID: ${messageId}`);
      return { success: true, messageId };

    } catch (error: any) {
      this.logger.error('Error enviando WhatsApp:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error };
    }
  }

  async checkMessageStatus(messageId: string): Promise<any> {
    try {
      if (!this.accessToken || this.accessToken === 'TEST_MODE') {
        return { status: 'simulation' };
      }

      const url = `${this.apiUrl}/${this.phoneNumberId}/messages/${messageId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Error verificando estado del mensaje:', error.message);
      throw new Error(`No se pudo verificar el estado del mensaje: ${error.message}`);
    }
  }

  private formatPhoneNumber(phone: string): string {
    let cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length === 8) {
      cleanPhone = '591' + cleanPhone; // Añade código de país
    }

    return cleanPhone;
  }
}
