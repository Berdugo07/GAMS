import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './controllers/notification.controller';

import {
  ArchiveController,
  InboxController,
  FolderController,
  OutboxController,
  ProcessController,
} from './controllers';
import { ArchiveService, InboxService, FolderService, OutboxService } from './services';

import { AdministrationModule } from '../administration/administration.module';
import { ProceduresModule } from '../procedures/procedures.module';
import { GroupwareModule } from '../groupware/groupware.module';
import { Archive, ArchiveSchema, Communication, CommunicationSchema, Folder, FolderSchema } from './schemas';
import { NotificationService } from './services/notification.service'; 
import { WhatsAppBusinessService } from './services/whatsapp-business.service';
import { SocketModule } from '../communications/gateways/socket.module';
import { Notification, NotificationSchema } from './schemas/notification.schema';

@Module({
  imports: [
    HttpModule, forwardRef(() => SocketModule),
    MongooseModule.forFeature([
      { name: Communication.name, schema: CommunicationSchema },
      { name: Folder.name, schema: FolderSchema },
      { name: Archive.name, schema: ArchiveSchema },
       { name: Notification.name, schema: NotificationSchema },
    ]),
    AdministrationModule,
    GroupwareModule,
    ProceduresModule,
  ],
  controllers: [InboxController, ProcessController, FolderController, ArchiveController, OutboxController, NotificationController, ],
  providers: [InboxService, FolderService, ArchiveService, OutboxService, NotificationService, WhatsAppBusinessService],
  exports: [NotificationService,MongooseModule,WhatsAppBusinessService],
})
export class CommunicationsModule {}
