import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { UsersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { IsNull, LessThan } from 'typeorm';

describe('EventsService', () => {
  let service: EventsService;

  const eventRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  };

  const usersService = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: eventRepo,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get(EventsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save event', async () => {
      const user = { id: 'user-id' };
      const dto = {
        userId: 'user-id',
        title: 'Event',
        description: 'Desc',
      };

      const event = { id: 'event-id' };

      usersService.findByUserId.mockResolvedValue(user);
      eventRepo.create.mockReturnValue(event);
      eventRepo.save.mockResolvedValue(event);

      const result = await service.create(dto as any);

      expect(usersService.findByUserId).toHaveBeenCalledWith(dto.userId);
      expect(eventRepo.create).toHaveBeenCalled();
      expect(eventRepo.save).toHaveBeenCalledWith(event);
      expect(result).toEqual(event);
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      eventRepo.find.mockResolvedValue([{ id: '1' }]);

      const result = await service.findAll();

      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findOne', () => {
    it('should return event', async () => {
      const event = { id: '1' };
      eventRepo.findOneBy.mockResolvedValue(event);

      const result = await service.findOne('1');

      expect(result).toEqual(event);
    });

    it('should throw if event not found', async () => {
      eventRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByUser', () => {
    it('should return user events', async () => {
      eventRepo.find.mockResolvedValue([{ id: '1' }]);

      const result = await service.findAllByUser('user-id');

      expect(eventRepo.find).toHaveBeenCalledWith({
        where: { creator: { id: 'user-id' } },
        relations: ['creator'],
      });
      expect(result.length).toBe(1);
    });

    it('should throw if user has no events', async () => {
      eventRepo.find.mockResolvedValue([]);

      await expect(service.findAllByUser('user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      const event = {
        id: '1',
        title: 'old',
        description: 'old',
        endDate: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(event as any);
      eventRepo.save.mockResolvedValue(event);

      const dto = { title: 'new' };

      const result = await service.update('1', dto);

      expect(eventRepo.merge).toHaveBeenCalled();
      expect(eventRepo.save).toHaveBeenCalledWith(event);
      expect(result).toEqual(event);
    });
  });

  describe('remove', () => {
    it('should soft delete event', async () => {
      eventRepo.softDelete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('1')).resolves.toBeUndefined();
    });

    it('should throw if event not found', async () => {
      eventRepo.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cleanupExpiredEvents', () => {
    it('should return 0 if no expired events', async () => {
      eventRepo.find.mockResolvedValue([]);

      const result = await service.cleanupExpiredEvents();

      expect(result).toBe(0);
    });

    it('should soft delete expired events and return count', async () => {
      const expiredEvents = [{ id: '1' }, { id: '2' }];

      eventRepo.find.mockResolvedValue(expiredEvents);
      eventRepo.softDelete.mockResolvedValue({ affected: 2 });

      const result = await service.cleanupExpiredEvents();

      expect(eventRepo.find).toHaveBeenCalledWith({
        where: {
          endDate: LessThan(expect.any(Date)),
          deletedAt: IsNull(),
        },
      });

      expect(eventRepo.softDelete).toHaveBeenCalledWith(['1', '2']);
      expect(result).toBe(2);
    });
  });
});
