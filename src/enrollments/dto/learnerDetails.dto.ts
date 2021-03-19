import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class LearnerDetailsDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidLearnerId })
  learnerId: string;

  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
