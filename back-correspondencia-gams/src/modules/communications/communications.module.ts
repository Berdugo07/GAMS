import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from '../communications/controllers/notification.controller';
import { ObservationNotification, ObservationNotificationSchema } from './schemas/observation-notification.schema';

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
import { SocketModule } from '../communications/modules/socket.module';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Role, RoleSchema } from 'src/modules/users/schemas/role.schema'

@Module({
  imports: [
    HttpModule, forwardRef(() => SocketModule),
    MongooseModule.forFeature([
      { name: Communication.name, schema: CommunicationSchema },
      { name: Folder.name, schema: FolderSchema },
      { name: Archive.name, schema: ArchiveSchema },
       { name: ObservationNotification.name, schema: ObservationNotificationSchema }, 
      { name: Notification.name, schema: NotificationSchema },
      { name: Role.name, schema: RoleSchema },
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