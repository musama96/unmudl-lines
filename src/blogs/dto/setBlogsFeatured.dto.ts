import { IsEnum } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import {IsMongoId} from '../../common/validators';

export enum FeaturedStatus {
  FEATURE = 'feature',
  UNFEATURE = 'unfeature',
}

export class SetBlogsFeaturedDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidBlogId })
  blogId: string;

  @ApiProperty()
  @IsEnum(FeaturedStatus, { message: 'Select either feature or unfeature.' })
  status: FeaturedStatus;

  @ApiHideProperty()
  update?: any;
}
