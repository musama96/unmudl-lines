import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class AddReportDto {
  @IsMongoId(false, { message: responseMessages.addReportedActivity.reviewId })
  reviewId: string;

  @ApiHideProperty()
  status?: string;
  @ApiHideProperty()
  reviewDate?: any;
  @ApiHideProperty()
  reportDate?: any;
  @ApiHideProperty()
  @ApiHideProperty()
  reportedLearnerId?: string;
  @ApiHideProperty()
  reportingLearnerId?: string;
  @ApiHideProperty()
  reportingCollegeId?: string;
  @ApiHideProperty()
  reportingUserId?: string;
  @ApiHideProperty()
  comment?: string;
}
