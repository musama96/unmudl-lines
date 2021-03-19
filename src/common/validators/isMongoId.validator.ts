import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as mongoose from 'mongoose';

export function IsMongoId(optional, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsMongoId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (optional) {
            return value ? mongoose.Types.ObjectId.isValid(value) : true;
          } else {
            return value ? mongoose.Types.ObjectId.isValid(value) : false;
          }
        },
      },
    });
  };
}
