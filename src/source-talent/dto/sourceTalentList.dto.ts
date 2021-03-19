import { IsMongoId } from '../../common/validators';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { SourceTalentType } from './createSourceTalent.dto';

export class SourceTalentListDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: responseMessages.common.invalidKeyword })
  keyword?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  perPage?: number;

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, default: '-1' })
  @IsOptional()
  sortOrder?: string;

  @ApiProperty({ required: false, default: '' })
  @IsMongoId(true, { message: responseMessages.common.invalidEmployerId })
  employerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SourceTalentType, { message: responseMessages.createSourceTalent.type })
  type?: SourceTalentType;
}
