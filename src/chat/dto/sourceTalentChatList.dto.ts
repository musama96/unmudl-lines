import { IsMongoId } from '../../common/validators';
import { IsArray, IsEnum } from 'class-validator';
import { SourceTalentType } from '../../source-talent/dto/createSourceTalent.dto';

export class SourceTalentChatListDto {
  keyword?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: string;
  archive?: boolean;
  myChatsOnly?: boolean;

  @IsEnum(SourceTalentType)
  type: SourceTalentType;

  @IsArray()
  @IsMongoId(true, { each: true })
  sourceTalents: string[];
}
