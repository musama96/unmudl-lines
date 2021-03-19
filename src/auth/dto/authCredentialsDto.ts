import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class AuthCredentialsDto {
  @ApiProperty({ example: 'neohass77@gmail.com', description: 'Email address for logging into the college or admin portal.' })
  @IsEmail({}, { message: responseMessages.authCredentials.invalidEmail })
  emailAddress: string;

  @ApiProperty({ example: 'haseeb', description: 'Enter password for logging in.' })
  @IsString({ message: responseMessages.authCredentials.invalidPassword })
  password: string;
}
