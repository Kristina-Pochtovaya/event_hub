import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const PASSWORD = '12345';

jest.mock('bcrypt', () => ({
  compare: jest.fn((password) => password === PASSWORD),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user and return access token', async () => {
      const dto = {
        email: 'test@test.com',
        password: '12345',
        name: 'Test',
      };

      const user = {
        id: 'user-id',
        role: 'user',
      };

      mockUsersService.create.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.create).toHaveBeenCalledWith({
        ...dto,
        role: 'user',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          id: user.id,
          role: user.role,
        },
        { expiresIn: '1d' },
      );

      expect(result).toEqual({
        access_token: 'jwt-token',
      });
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if email is missing', async () => {
      await expect(
        service.login({ email: '', password: PASSWORD }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(undefined);

      await expect(
        service.login({ email: 'missing@test.com', password: PASSWORD }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return access token if user exists', async () => {
      const user = {
        id: 'user-id',
        role: 'user',
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        email: 'test@test.com',
        password: PASSWORD,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@test.com');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: user.id,
        role: user.role,
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
      });
    });
  });
});
