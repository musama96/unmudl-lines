import { IsMongoId } from '../../common/validators';

export class TagIdDto {
  @IsMongoId(false)
  tagId: string;
}
