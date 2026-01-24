import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsRoleValid } from '../../common/validators/is_role_valid.validator';
import { IsEmailExisting } from '../../common/validators/is_email_existing.validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsEmail()
  @MinLength(3)
  @IsEmailExisting()
  @Transform(({ value }) => value.trim().replace(/\s+/g, ' '))
  email: string;

  @IsString()
  @IsRoleValid()
  role: string;

  @IsString()
  @Transform(({ value }) => value.toString())
  password: string;
}
