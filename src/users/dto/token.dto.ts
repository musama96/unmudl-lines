import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  readonly token?: string;
}
