import {IsHexColor, IsString} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {ApiProperty} from '@nestjs/swagger';

export class AddPartnerGroupDto {
  @IsString({message: responseMessages.addPartnerGroup.title})
  title: string;

  @ApiProperty({example: '#FFFFFF'})
  @IsHexColor({message: responseMessages.addPartnerGroup.color})
  color: string;
}
