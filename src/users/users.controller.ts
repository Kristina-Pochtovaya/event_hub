import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll() {
    return await this.users.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.users.findByUserId(id);
  }
}
