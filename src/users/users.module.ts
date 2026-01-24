import { Module } from '@nestjs/common';
import { IsEmailExistingConstraint } from '../common/validators/is_email_existing.validator';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, IsEmailExistingConstraint],
  exports: [UsersService, IsEmailExistingConstraint],
})
export class UsersModule {}
