import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class UpdateAdminDto {
  @ApiProperty()
  fullname?: string;

  @ApiProperty()
  designation?: string;

  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidEmployerAdminId })
  adminId?: string;

  profilePhotoPath?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  profilePhoto?: string;

  @ApiHideProperty()
  profilePhotoThumbnail?: string;
}
