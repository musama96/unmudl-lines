import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class EmployerAuthCredentialsDto {
  @ApiProperty({ example: 'yousaf.zain000+14@gmail.com', description: 'Email address for logging into the employer portal.' })
  @IsEmail({}, { message: responseMessages.authCredentials.invalidEmail })
  emailAddress: string;

  @ApiProperty({ example: 'Abc123456', description: 'Enter password for logging in.' })
  @IsString({ message: responseMessages.authCredentials.invalidPassword })
  password: string;
}
