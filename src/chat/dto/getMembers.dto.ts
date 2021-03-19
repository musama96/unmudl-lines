import { ChatType } from '../chat.model';

export class GetMembersDto {
  keyword?: string;
  perPage?: number;
  type?: ChatType;
}
