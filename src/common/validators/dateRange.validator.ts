import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';
import {HttpException, HttpStatus} from '@nestjs/common';
import {TimeRangeDto} from '../dto/timeRange.dto';

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
            if (new Date(value).getTime() >= new Date(relatedValue).getTime()) {
              // console.log(relatedValue);
              // relatedValue = new Date();
              return true;
            }
            return false;
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
