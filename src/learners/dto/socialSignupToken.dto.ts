
import {IsString, IsNotEmpty} from 'class-validator';

export class SocialSignupTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

}
