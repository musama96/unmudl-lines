import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class CreateContactCollegeProposalDto {
  @ApiProperty()
    // use updated mongo decorator
    // @IsMongoId(false, { message: responseMessages.common.invalidContactCollegeProposalId })
  draftProposalId?: string;

  @ApiProperty()
  emptyAttachments?: boolean;

  @ApiProperty()
  @IsNotEmpty({ message: responseMessages.createContactCollegeProposal.title })
  title: string;

  @ApiProperty()
    // use updated mongo decorator
    // @IsMongoId(false, { message: responseMessages.common.invalidContactCollegeProposalId })
  category: string;

  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidSubCategoryId })
  subCategory: string;

  @ApiProperty()
  @IsNotEmpty({ message: responseMessages.createContactCollegeProposal.description })
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  attachments: any;

  @ApiProperty()
  visibility: 'all' | 'selected';

  @ApiProperty()
    // use updated mongo decorator
    // @IsArray()
    // @IsMongoId(false, { message: responseMessages.common.invalidCollegeId, each: true })
  colleges: string[];

  @ApiProperty()
  locations: string[];

  @ApiProperty()
  showToEmployerAdmins?: string[];

  @ValidateNested({ each: true })
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto[];

  @ApiHideProperty()
  employer?: string;
  @ApiHideProperty()
  addedBy?: string;
}
