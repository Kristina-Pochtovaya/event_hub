import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register_user.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(201)
  async login(@Body() body: { email: string }) {
    return this.authService.login(body);
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.authService.register(body);
  }

  @UseGuards(AdminGuard)
  @Post('create-admin')
  createAdmin(@Body() dto: RegisterUserDto) {
    return this.usersService.create({ ...dto, role: 'admin' });
  }
}
