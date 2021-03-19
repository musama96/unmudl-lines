import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class ContactCollegesProposalResponsesListDto {
  @ApiProperty()
  keyword?: string;

  @ApiProperty()
  @IsNotEmpty({ message: responseMessages.common.invalidSortBy })
  sortBy?: string;

  @ApiProperty()
  @IsIn(['asc', 'desc'], { message: responseMessages.common.invalidSortOrder })
  sortOrder?: string;

  proposals?: string[];

  @ApiProperty()
  page?: number;

  @ApiProperty()
  perPage?: number;

  @ApiHideProperty()
  collegeId?: string;

  @ApiHideProperty()
  employerId?: string;

  @ApiHideProperty()
  employerAdminId?: string;

  @ApiHideProperty()
  employerAdminRole?: string;

  @ApiHideProperty()
  userId?: string;
}
