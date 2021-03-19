import { IsArray, IsMongoId } from '../../common/validators';

export class ArchiveChatDto {
  @IsMongoId(false)
  chatId: string;

  archive?: boolean;
}
