import { IsString } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class CheckPromoDto {
  @IsMongoId(false)
  @ApiProperty({ required: false })
  courseId: string;

  @IsString()
  @ApiProperty({ required: false })
  promoCode: string;

  @ApiHideProperty()
  learnerId?: string;

  @ApiHideProperty()
  cart?: object[];
}
