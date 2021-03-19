import { IsString } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class AddUserEnquiryDto {
  @IsMongoId(false)
  enquiryGroupId: string;

  @IsString()
  message: string;

  @ApiHideProperty()
  user?: object;
}
