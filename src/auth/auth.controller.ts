import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register_user.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
