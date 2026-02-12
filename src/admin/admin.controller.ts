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
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { EventsService } from '../events/events.service';
import { UpdateEventDto } from '../events/dto/update_event.dto';
import { RegisterUserDto } from '../auth/dto/register_user.dto';
import { UsersService } from '../users/users.service';

@UseGuards(AdminGuard)
@Controller('admins')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getPlatformStats();
  }

  @Post('events/import')
  importEvents() {
    return this.adminService.enqueueImport();
  }

  @Post('admin')
  createAdmin(@Body() dto: RegisterUserDto) {
    return this.usersService.create({ ...dto, role: 'admin' });
  }

  @Patch(':id')
  moderate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.eventsService.remove(id);
  }
}
