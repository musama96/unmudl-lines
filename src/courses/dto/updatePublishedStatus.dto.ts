import { IsBoolean } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

enum UpdatePublishStatus {
  LIVE = 'live',
  COMING_SOON = 'coming_soon',
  UNPUBLISH = 'unpublished',
}

export class UpdatePublishedStatusDto {
  @IsMongoId(false, { message: responseMessages.unpublishCourse.id })
  _id: string;

  status: UpdatePublishStatus;

  @ApiHideProperty()
  unpublishedDate?: string;

  @ApiHideProperty()
  unpublishedBy?: string;
}
