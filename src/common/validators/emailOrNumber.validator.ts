import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';
import {HttpException, HttpStatus} from '@nestjs/common';
import {TimeRangeDto} from '../dto/timeRange.dto';

export function IsEitherMailOrPhnNumber(property: string, validationOptions?: ValidationOptions) {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsEitherMailOrPhnNumber',
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
            // console.log(relatedValue);
            if (value || relatedValue) {
              return true;
            }
            return false;
          } catch (e) {
            throw new HttpException({
              status: HttpStatus.BAD_REQUEST,
              message: 'Validation failed: Please check individual fields for specific errors.',
              errors: [{
                contact: 'Provide either an email or phone number.',
              }],
            }, HttpStatus.BAD_REQUEST);
          }
        },
      },
    });
  };
}
