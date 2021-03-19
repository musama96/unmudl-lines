import {IsNotEmpty} from 'class-validator';

export class CardIdDto {
  @IsNotEmpty({message: 'You must enter a valid stripe card id.'})
  cardId?: string;
}
