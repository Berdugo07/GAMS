import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AdministrationModule } from 'src/modules/administration/administration.module';
import { InternalController, ExternalController } from './controllers';
import { ExternalService, InternalService, ProcedureFactoryService } from './services';
import {
  Procedure,
  ProcedureSchema,
  ExternalProcedure,
  ExternalProcedureSchema,
  InternalProcedure,
  InternalProcedureSchema,
} from './schemas';

@Module({
  imports: [
    ConfigModule,
    AdministrationModule,
    MongooseModule.forFeature([
      {
        name: Procedure.name,
        schema: ProcedureSchema,
        discriminators: [
          { name: InternalProcedure.name, schema: InternalProcedureSchema },
          { name: ExternalProcedure.name, schema: ExternalProcedureSchema },
        ],
      },
    ]),
  ],
  controllers: [InternalController, ExternalController],
  providers: [ExternalService, InternalService, ProcedureFactoryService],
  exports: [MongooseModule, ProcedureFactoryService],
})
export class ProceduresModule {}
