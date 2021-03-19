import { HttpService, Injectable } from '@nestjs/common';
import {
  PRAGYA_KEY,
  PRAGYA_SECRET,
  PRAGYA_URL_CREATE_ENROLLMENT,
  PRAGYA_URL_CREATE_USER,
  PRAGYA_URL_GET_COURSE_LAUNCH_URL,
  PRAGYA_URL_GET_TOKEN,
} from '../config/config';

@Injectable()
export class ExternalService {
  constructor(private readonly httpService: HttpService) {}

  async getLmsToken(): Promise<any> {
    return await this.httpService
      .post(PRAGYA_URL_GET_TOKEN, {
        key: PRAGYA_KEY,
        secret: PRAGYA_SECRET,
      })
      .toPromise();
  }

  async createLmsUser(user): Promise<any> {
    return await this.httpService
      .post(PRAGYA_URL_CREATE_USER, user, {
        headers: {
          authorization: `Bearer ${user.accessToken}`,
        },
      })
      .toPromise();
  }

  async createLmsEnrollment(enrollment): Promise<any> {
    return await this.httpService
      .post(PRAGYA_URL_CREATE_ENROLLMENT, enrollment, {
        headers: {
          authorization: `Bearer ${enrollment.accessToken}`,
        },
      })
      .toPromise();
  }

  async cancelLmsEnrollment(enrollment): Promise<any> {
    return await this.httpService
      .post(PRAGYA_URL_CREATE_ENROLLMENT, enrollment, {
        headers: {
          authorization: `Bearer ${enrollment.accessToken}`,
        },
      })
      .toPromise();
  }

  async getCourseLaunch(course): Promise<any> {
    try {
      return await this.httpService
        .post(PRAGYA_URL_GET_COURSE_LAUNCH_URL, course, {
          headers: {
            authorization: `Bearer ${course.accessToken}`,
          },
        })
        .toPromise();
    } catch (e) {
      return {
        data: {
          courseLaunchURL: null,
        },
      };
    }
  }
}
