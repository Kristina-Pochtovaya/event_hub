import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { userRole } from '../user_role';

export function IsRoleValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsRoleValid',
      target: object.constructor,
      propertyName,
      constraints: Object.values(userRole),
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!args.constraints.includes(value)) {
            return false;
          }

          return true;
        },
        defaultMessage() {
          return `User role $value must have admin or user value`;
        },
      },
    });
  };
}
