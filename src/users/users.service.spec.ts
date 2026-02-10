import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create_user.dto';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

const PASSWORD = 'pass';
const HASHED_PASSWORD = `hashed-${PASSWORD}`;

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => HASHED_PASSWORD),
}));

describe('UsersService', () => {
  let service: UsersService;
  const userRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const dto: CreateUserDto = {
        name: 'John',
        email: 'john@example.com',
        password: HASHED_PASSWORD,
        role: 'user',
      };
      const user = { ...dto, id: '1' };

      userRepo.create.mockReturnValue(user);
      userRepo.save.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(userRepo.create).toHaveBeenCalledWith(dto);
      expect(userRepo.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      userRepo.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(userRepo.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      const user = { id: '1', email: 'john@example.com' };
      userRepo.findOneBy.mockResolvedValue(user);

      const result = await service.findByEmail('john@example.com');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);

      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return user if found', async () => {
      const user = { id: '1', email: 'john@example.com' };
      userRepo.findOneBy.mockResolvedValue(user);

      const result = await service.findByUserId('1');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);

      await expect(service.findByUserId('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
