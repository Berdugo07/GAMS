import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema, User, UserSchema } from './schemas';
import { RoleService, UserService } from './services';

@Module({
  controllers: [],
  providers: [RoleService, UserService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  exports: [MongooseModule, UserService, RoleService],
})
export class UsersModule {}
