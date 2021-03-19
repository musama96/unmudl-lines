import { IsMongoId } from '../../common/validators';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { LearnerDataDto } from '../../enrollments/dto/learnerData.dto';

export class RedeemGiftDto {
  @ApiProperty({ required: false })
  @IsNotEmpty({ message: responseMessages.giftCourse.giftCode })
  giftCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LearnerDataDto)
  learnerData?: LearnerDataDto;
}
