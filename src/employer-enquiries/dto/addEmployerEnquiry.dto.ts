import { IsNotEmpty } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class AddEmployerEnquiryDto {
  @ApiProperty({ description: 'Provide college id if enquiry is for college. If it is for unmudl, keep id empty.' })
  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId: string;

  @IsNotEmpty({ message: 'Message cannot be empty' })
  message: string;

  @ApiHideProperty()
  employerAdminId?: string;
}
