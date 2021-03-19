import {HttpException} from '@nestjs/common';

export default {
  success(data = null, message = '', status = 200) {
    return {
      success: true,
      status,
      data,
      message,
    };
  },
  fail(message = '', error = null, status = 400) {
    throw new HttpException({
      status,
      message: message ? message : 'There was an error. Please try again later.',
      errors: error ? [error] : [],
    }, status);
  },
};

export interface SuccessInterface {
  success: boolean;
  status: number;
  data: any;
  message: string;
}
