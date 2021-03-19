import {IsEnum, IsIn, IsMongoId, IsNumber, IsOptional, IsString} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {ApiHideProperty} from '@nestjs/swagger';

export class CardIdDto {

  @IsString({message: responseMessages.createEnrollment.stripeCustomerId})
  cardId: string;

}
