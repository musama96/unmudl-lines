import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, Matches, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class ResetPasswordDto {
  // @IsNumber()
  @IsNotEmpty()
  readonly code: number;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.updateUser.invalidPassword })
  readonly password: string;
}
