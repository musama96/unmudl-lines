import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class CollegeIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidCollegeId })
  collegeId: string;
}
