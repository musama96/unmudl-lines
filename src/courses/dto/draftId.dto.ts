import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class DraftIdDto {
  @ApiProperty()
  @IsMongoId(false)
  draftId: string;
}
