import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export enum EmployerRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateEmployerRequestStatusDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.partnerRequestId })
  employerRequestId: string;

  @ApiProperty()
  @IsEnum(EmployerRequestStatus, { message: responseMessages.updatePartnerRequestStatus.status })
  status: EmployerRequestStatus;
}
