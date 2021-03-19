import { Injectable, ArgumentMetadata, PipeTransform, HttpException, HttpStatus } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import responseMessages from '../config/responseMessages';
import { NUMBER_STRING_FIELDS } from '../config/config';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // if (value instanceof Object && this.isEmpty(value)) {
    //   throw new HttpException(
    //     'Validation failed: No body submitted',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    for (const field in value) {
      // apply JSON.parse on all the field except those mentioned in the config
      if (!NUMBER_STRING_FIELDS.includes(field)) {
        if (value[field]) {
          if (typeof value[field] === 'string') {
            value[field] = value[field].trim();
          }
          value[field] = this.jsonParse(value[field]);
        }
      }

      // iterate over all the fields and delete the field if it contains null or empty string to improve validation
      // check if the value is object
      if (value[field] && typeof value[field] === 'object') {
        // check if length attribute exists on the value
        // if it does not, it is an object else an array
        if (!(value[field].length > 0)) {
          // iterate over object fields and delete any null field
          for (const fieldC in value[field]) {
            if (!value[field][fieldC] && value[field][fieldC] !== false) {
              delete value[field][fieldC];
            }
          }
        }
      } else {
        if (!value[field] && value[field] !== '' && value[field] !== false && value[field] !== 0) {
          delete value[field];
        } else if (value[field] === '') {
          value[field] = null;
        }
      }
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: responseMessages.common.fieldValidationError,
          errors: this.formatErrors(errors),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }

  private jsonParse(field) {
    try {
      return JSON.parse(field);
    } catch (e) {
      return field;
    }
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }

  private formatErrors(errors: ValidationError[]) {
    const fieldErrors = {};
    for (let i = 0; i < errors.length; i++) {
      const err = errors[i];
      let children = true;
      for (const property in err.constraints) {
        children = false;
        if (err.constraints.hasOwnProperty(property)) {
          fieldErrors[err.property] = err.constraints[property];
        }
      }
      if (children && err.children && err.children.length > 0) {
        const errs = {};
        for (let j = 0; j < err.children.length; j++) {
          for (const property in err.children[j].constraints) {
            errs[err.children[j].property] = err.children[j].constraints[property];
          }
        }

        fieldErrors[err.property] = errs;
      }
    }
    return fieldErrors;
  }

  private isEmpty(value: any) {
    if (Object.keys(value).length > 0) {
      return false;
    }
    return true;
  }
}
