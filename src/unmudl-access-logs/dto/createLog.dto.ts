import { IsMongoId } from '../../common/validators';

export class CreateLogDto {
  type: 'college' | 'employer';
  user: string;
  employer?: string;
  college?: string;
}
