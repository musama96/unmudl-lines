import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export enum PartnerRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdatePartnerRequestStatusDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.partnerRequestId })
  partnerRequestId: string;

  @ApiProperty()
  @IsEnum(PartnerRequestStatus, { message: responseMessages.updatePartnerRequestStatus.status })
  status: PartnerRequestStatus;
}
