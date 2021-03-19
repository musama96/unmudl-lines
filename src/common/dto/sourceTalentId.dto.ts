import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../validators/isMongoId.validator';

export class SourceTalentIdDto {
  @ApiProperty({ required: false })
  @IsMongoId(false, { message: responseMessages.common.invalidSourceTalentId })
  id?: string;
}
