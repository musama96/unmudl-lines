import { IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class AddTransactionDto {
  @IsMongoId(false, { message: responseMessages.addTransaction.courseId })
  courseId: string;

  // @IsNumber({}, { message: responseMessages.addTransaction.amount })
  amount: number;

  @ApiHideProperty()
  collegeId: string;
}
