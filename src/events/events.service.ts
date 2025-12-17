import { Injectable, NotFoundException } from '@nestjs/common';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create_event.dto';
import { UsersService } from '../users/users.service';
import { UpdateEventDto } from './dto/update_event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateEventDto) {
    const user = await this.usersService.findOne(dto.userId);

    const event = this.eventRepo.create({
      title: dto.title,
      description: dto.description,
      creator: user,
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
    });

    return this.eventRepo.save(event);
  }

  async remove(id: string): Promise<void> {
    const res = await this.eventRepo.softDelete({ id });

    if (!res.affected) {
      throw new NotFoundException('Event not found');
    }
  }
}
