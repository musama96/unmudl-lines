import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class UpdateSuspendLearnerDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidLearnerId })
  learnerId: string;

  @IsBoolean()
  suspend: boolean;
}
