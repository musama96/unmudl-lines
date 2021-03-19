import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';
import {HttpException, HttpStatus} from '@nestjs/common';
import * as moment from 'moment';

export function IsTimeString(validationOptions?: ValidationOptions) {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsTimeString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      // @ts-ignore
      validator: {
        validate(value: any, args: ValidationArguments) {
          try {
            // console.log(moment(moment(value, 'LT').format('LT'), 'LT', true).isValid());
            return (moment(moment(value, 'LT').format('LT'), 'LT', true).isValid());
          } catch (e) {
            throw new HttpException({
              status: HttpStatus.BAD_REQUEST,
              message: 'Validation failed: Please check individual fields for specific errors.',
              errors: [{
                time: 'start and end must be a valid time string.',
              }],
            }, HttpStatus.BAD_REQUEST);
          }
        },
      },
    });
  };
}
