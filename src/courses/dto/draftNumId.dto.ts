import { IsArray, IsOptional, IsNumber, IsMongoId, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class DraftNumIdDto {
  @ApiProperty()
  // @IsNumber()
  draftId: string;
}
