import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmailExisting } from 'src/common/validators/is_email_existing.validator';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register_user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(IsEmailExisting)
  async register(dto: RegisterUserDto): Promise<{ access_token: string }> {
    const user = await this.usersService.create({
      ...dto,
      role: 'user',
    });

    const payload = { id: user.id, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(dto: { email: string }): Promise<{ access_token: string }> {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.usersService.findByEmail(dto.email);

    if (user === undefined) {
      throw new NotFoundException('User not found');
    }

    const payload = { id: user.id, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
