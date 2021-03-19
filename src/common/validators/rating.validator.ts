import {registerDecorator, ValidationOptions, ValidationArguments} from 'class-validator';
import {HttpException, HttpStatus} from '@nestjs/common';

export function IsRating(validationOptions?: ValidationOptions) {
  return (object, propertyName: string) => {
    registerDecorator({
      name: 'IsRating',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      // @ts-ignore
      validator: {
        validate(ratings: any, args: ValidationArguments) {
          try {
            let isValid = true;
            ratings.forEach(item => {
              const n = Number(item);
              if (!(n && n > 0 && n <= 5)) {
                isValid = false;
              }
            });
            if (!isValid) {
              throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                message: 'Validation failed: Please check individual fields for specific errors.',
                errors: [{
                  rating: 'Rating must be a stringified array of numbers between 1 and 5.',
                }],
              }, HttpStatus.BAD_REQUEST);
            }
            return isValid;
          } catch (e) {
            throw new HttpException({
              status: HttpStatus.BAD_REQUEST,
              message: 'Validation failed: Please check individual fields for specific errors.',
              errors: [{
                rating: 'Rating must be a stringified array of numbers between 1 and 5.',
              }],
            }, HttpStatus.BAD_REQUEST);
          }
        },
      },
    });
  };
}
