import { IsBoolean } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class UpdatePreferencesDto {
  @IsBoolean({ message: responseMessages.updateUser.emailPreference })
  email: boolean;

  @IsBoolean({ message: responseMessages.updateUser.enrollmentPreference })
  enrollment: boolean;

  @IsBoolean({ message: responseMessages.updateUser.refundPreference })
  refund: boolean;

  @IsBoolean({ message: responseMessages.updateUser.newNotificationPreference })
  newNotification: boolean;

  @IsBoolean({ message: responseMessages.updateUser.buyCoursePreference })
  buyCourse: boolean;
}
