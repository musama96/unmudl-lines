import { IsHexColor, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class UpdatePartnerGroupDto {
  @IsMongoId(false, { message: responseMessages.addPartnerGroup.id })
  _id: string;

  @IsString({ message: responseMessages.addPartnerGroup.title })
  title: string;

  @ApiProperty({ example: '#FFFFFF' })
  @IsHexColor({ message: responseMessages.addPartnerGroup.color })
  color: string;
}
