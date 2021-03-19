import { IsString, IsEmail, IsNotEmpty, IsOptional, IsMongoId, Matches, IsIn, IsEnum } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages.updateUser.invalidPassword })
  password: string;
}
