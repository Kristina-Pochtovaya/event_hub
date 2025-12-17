import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from 'src/users/users.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsEmailExistingConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UsersService) {}

  async validate(email: string) {
    const users = await this.userService.findAll();
    const existingEmails = users.map((user) => user.email);

    if (existingEmails.includes(email)) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Email $value should be unique';
  }
}

export function IsEmailExisting(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsEmailExisting',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEmailExistingConstraint,
      async: true,
    });
  };
}
