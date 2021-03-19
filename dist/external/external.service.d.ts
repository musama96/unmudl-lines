import { HttpService } from '@nestjs/common';
export declare class ExternalService {
    private readonly httpService;
    constructor(httpService: HttpService);
    getLmsToken(): Promise<any>;
    createLmsUser(user: any): Promise<any>;
    createLmsEnrollment(enrollment: any): Promise<any>;
    cancelLmsEnrollment(enrollment: any): Promise<any>;
    getCourseLaunch(course: any): Promise<any>;
}
