import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsEitherMailOrPhnNumber } from '../../common/validators';

export class UserAuthCredentialsDto {
  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @ApiProperty({
    required: false,
    example: 'neohass77@gmail.com',
    description: 'Email address for logging into the college or admin portal.',
  })
  @IsEmail({}, { message: responseMessages.authCredentials.invalidEmail })
  @IsOptional()
  @IsEitherMailOrPhnNumber('phoneNumber', { message: responseMessages.createLearner.contact })
  emailAddress: string;

  @ApiProperty({ example: 'haseeb', description: 'Enter password for logging in.' })
  @IsString({ message: responseMessages.authCredentials.invalidPassword })
  password: string;
}
