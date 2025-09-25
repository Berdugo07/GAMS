import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';

import { AdministrationModule } from './modules/administration/administration.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { GroupwareModule } from './modules/groupware/groupware.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';


import { EnvVars, validate } from './config';
@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvVars>) => ({
        uri: configService.get('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
   
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    AdministrationModule,
    ProceduresModule,
    GroupwareModule,
    CommunicationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
