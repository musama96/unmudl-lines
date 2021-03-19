import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, Matches } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.updateUser.invalidPassword })
  readonly password: string;
}
