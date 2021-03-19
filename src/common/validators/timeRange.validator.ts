import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';
import {HttpException, HttpStatus} from '@nestjs/common';
import * as moment from 'moment';

export function IsGreaterThanStart(property: string, validationOptions?: ValidationOptions) {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsGreaterThanStart',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      // @ts-ignore
      validator: {
        validate(value: any, args: ValidationArguments) {
          try {
            const [relatedPropertyName] = args.constraints;
            const relatedValue = (args.object as any)[relatedPropertyName];
            // console.log(args);
            if (relatedValue && moment(value, 'LT').isBefore(moment(relatedValue, 'LT'))) {
              // console.log(relatedValue);
              // relatedValue = new Date();
              return false;
            }
            return true;
          } catch (e) {
            throw new HttpException({
              status: HttpStatus.BAD_REQUEST,
              message: 'Validation failed: Please check individual fields for specific errors.',
              errors: [{
                end: 'End value must be graeter than start.',
              }],
            }, HttpStatus.BAD_REQUEST);
          }
        },
      },
    });
  };
}
