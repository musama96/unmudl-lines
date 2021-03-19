import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import * as dotenv from 'dotenv';
import { response } from 'express';

dotenv.config();

const baseUrl = 'https://api.dev.unmudl-development.com/api';

describe('ROOT', () => {
  it('Should Ping', () => {
    return request(baseUrl)
      .get('/')
      .expect(404);
  });
});
