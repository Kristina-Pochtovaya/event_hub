import { Injectable, NotFoundException } from '@nestjs/common';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create_event.dto';
import { UsersService } from '../users/users.service';
import { UpdateEventDto } from './dto/update_event.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { EventsCleanupCron } from './events-cleanup.cron';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectQueue('events-cleanup') private readonly eventsCleanupQueue: Queue,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateEventDto) {
    const user = await this.usersService.findByUserId(dto.userId);

    const event = this.eventRepo.create({
      title: dto.title,
      description: dto.description,
      creator: user,
      endDate: new Date(),
    });

    return this.eventRepo.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepo.find();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepo.findOneBy({ id });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findAllByUser(userId: string): Promise<Event[]> {
    const events = await this.eventRepo.find({
      where: { creator: { id: userId } },
      relations: ['creator'],
    });

    if (events.length === 0) {
      throw new NotFoundException('User have not created any events yet');
    }

    return events;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    this.eventRepo.merge(event, {
      title: dto.title ?? event.title,
      description: dto.description ?? event.description,
      endDate: dto.endDate ?? event.endDate,
    });

    return this.eventRepo.save(event);
  }

  async remove(id: string): Promise<void> {
    const res = await this.eventRepo.softDelete({ id });

    if (!res.affected) {
      throw new NotFoundException('Event not found');
    }
  }

  async cleanupExpiredEvents(): Promise<number> {
    const now = new Date();

    const expiredEvents = await this.eventRepo.find({
      where: {
        endDate: LessThan(now),
        deletedAt: IsNull(),
      },
    });

    if (!expiredEvents.length) {
      return 0;
    }

    await this.eventRepo.softDelete(expiredEvents.map((event) => event.id));

    return expiredEvents.length;
  }
}
