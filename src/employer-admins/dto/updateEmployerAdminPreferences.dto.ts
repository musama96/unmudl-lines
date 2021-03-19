import { IsBoolean } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class UpdateEmployerAdminPreferencesDto {
  @IsBoolean()
  email: boolean;

  @IsBoolean()
  proposal: boolean;

  @IsBoolean()
  chat: boolean;

  @IsBoolean()
  newNotification: boolean;
}
