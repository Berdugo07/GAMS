import { IsArray, IsString, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsArray()
  ids: string[];

  @IsString()
  @MinLength(4)
  observation: string;
}
