import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import { IsMongoId } from '../../common/validators';
import responseMessages from '../../config/responseMessages';

export class UpdateContactCollegeDraftProposalDto {
  @ApiProperty()
  emptyAttachments?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  // use updated mongo decorator
  // @IsMongoId(false, { message: responseMessages.common.invalidContactCollegeProposalId })
  category: string;

  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidSubCategoryId })
  subCategory: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  attachments: any;

  @ApiProperty()
  previousAttachments: string[];

  @ApiProperty()
  visibility: 'all' | 'selected';

  @ApiProperty()
  // use updated mongo decorator
  // @IsArray()
  // @IsMongoId(false, { message: responseMessages.common.invalidCollegeId, each: true })
  colleges: string[];

  @ApiProperty()
  locations: string[];

  @ValidateNested({ each: true })
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto[];

  @ApiHideProperty()
  employer?: string;
  @ApiHideProperty()
  addedBy?: string;
}
