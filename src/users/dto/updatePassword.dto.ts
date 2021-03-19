import { IsString, IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: responseMessages.updateUser.invalidPassword })
  oldPassword: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.updateUser.invalidPassword })
  newPassword: string;
}
