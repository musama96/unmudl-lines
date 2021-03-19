import { IsString, IsOptional, IsNumber, IsMongoId, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import errorMessages from '../../config/responseMessages';

export class RecentRepliesDto {
  @ApiProperty({ required: false, default: '7' })
  @IsOptional()
  // @IsNumber({}, { message: errorMessages.common.invalidPerPage })
  perPage: number;
}
