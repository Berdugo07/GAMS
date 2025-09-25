import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { WhatsAppBusinessService } from '../services/whatsapp-business.service';

@WebSocketGateway({
  cors: { origin: 'http://localhost:4200' }, 
})
@Injectable()
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(private whatsAppService: WhatsAppBusinessService) {}

  async notifyWhatsApp(procedureId: string, message: string, to: string) {
    let success = false;       // ✅ variable inicializada
    let error: string | null = null;

    try {
      const result = await this.whatsAppService.sendMessage(to, message);
      success = result.success; // ✅ actualizar la variable existente
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      error = err.message || 'Error desconocido';
    }

    this.server.emit('whatsappNotification', { procedureId, success, error });
  }
   emitWhatsAppNotification(data: { procedureId: string; success: boolean; error?: string }) {
    this.server.emit('whatsappNotification', data);
  }
}
