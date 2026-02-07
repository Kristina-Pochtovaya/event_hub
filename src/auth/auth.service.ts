import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmailExisting } from '../common/validators/is_email_existing.validator';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register_user.dto';
import * as bcrypt from 'bcrypt';

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

  async login(dto: {
    email: string;
    password: string;
  }): Promise<{ access_token: string }> {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.usersService.findByEmail(dto.email);

    if (user === undefined) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { id: user.id, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
