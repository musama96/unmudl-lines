import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class SuspendLearnerDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidLearnerId })
  learnerId?: string;
}
