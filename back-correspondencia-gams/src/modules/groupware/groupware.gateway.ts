import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { Communication } from '../communications/schemas';
import { GroupwareService } from './groupware.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

import { JwtPayload } from '../auth/interfaces';

interface canceledCommunications {
  toUser: string;
  id: string;
}
@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GroupwareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private groupwareService: GroupwareService, private jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    try {
      const token = client.handshake.auth.token;
      const decoded: JwtPayload = this.jwtService.verify(token);
      client.data['user'] = decoded;
      this.groupwareService.onClientConnected(client.id, decoded);
      this.server.emit('clientsList', this.groupwareService.getClients());
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.groupwareService.onClientDisconnected(client.id);
    client.broadcast.emit('clientsList', this.groupwareService.getClients());
  }

  sentCommunications(communications: { toUser: string; communication: Communication }[]): void {
    for (const { toUser, communication } of communications) {
      const user = this.groupwareService.getUser(toUser);
      if (!user) return;
      this.server.to(user.socketIds).emit('new-communication', communication);
    }
  }

  cancelCommunications(items: canceledCommunications[]): void {
    for (const { toUser, id } of items) {
      const user = this.groupwareService.getUser(toUser);
      if (user) {
        this.server.to(user.socketIds).emit('cancel-communication', id);
      }
    }
  }


}
