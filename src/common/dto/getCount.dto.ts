import { IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class GetCountDto {
  @ApiProperty({ required: false, default: new Date().toISOString() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidStartDate })
  start?: string;

  @ApiProperty({ required: false, default: new Date().toISOString() })
  @IsOptional()
  @IsDateString({ message: responseMessages.common.invalidEndDate })
  end?: string;

  @ApiProperty({ required: false, description: 'Valid options: 1, 30 or 365' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidInterval })
  interval?: number;

  @ApiProperty({ required: false })
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
