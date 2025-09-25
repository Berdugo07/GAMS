import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { CommunicationsModule } from '../communications.module';

@Module({
  imports: [forwardRef(() => CommunicationsModule)],
  providers: [SocketGateway],
  exports: [SocketGateway], 
})
export class SocketModule {}
