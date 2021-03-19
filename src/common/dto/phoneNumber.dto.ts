import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class PhoneNumberDto {
  // @Matches(PHONE_NUMBER_REGEX, '', {message: responseMessages.common.invalidPhoneNumber})
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsMongoId(true)
  learnerId?: string;
}
