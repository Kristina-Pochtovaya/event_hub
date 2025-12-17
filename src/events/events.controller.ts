import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create_event.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UpdateEventDto } from './dto/update_event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll() {
    return await this.events.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.events.findOne(id);
  }

  @Get('user/:userId')
  @UseInterceptors(CacheInterceptor)
  async findAllByUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return await this.events.findAllByUser(userId);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateEventDto) {
    return this.events.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.events.remove(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.events.update(id, dto);
  }
}
