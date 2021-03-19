import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsArray(optional: boolean, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value ? Array.isArray(value) : optional;
        },
      },
    });
  };
}
