import { IsMongoId } from '../../common/validators';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { StateDto } from '../../common/dto/state.dto';
import responseMessages from '../../config/responseMessages';

export class UpdateCollegeOrStateDto {
  @IsMongoId(false)
  subscription?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  college?: string;

  @ValidateNested()
  @Type(() => StateDto)
  state?: StateDto;
}
