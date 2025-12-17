import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description: string;
}
