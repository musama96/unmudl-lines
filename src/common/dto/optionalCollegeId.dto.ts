import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class OptionalCollegeIdDto {
  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
