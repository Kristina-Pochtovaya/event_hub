import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsEmailExisting } from '../../common/validators/is_email_existing.validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @IsEmail()
  @MinLength(3)
  @IsEmailExisting()
  @Transform(({ value }: { value: string }) =>
    value.trim().replace(/\s+/g, ' '),
  )
  email!: string;

  @IsString()
  @Transform(({ value }: { value: string }) => value.toString())
  password!: string;
}
