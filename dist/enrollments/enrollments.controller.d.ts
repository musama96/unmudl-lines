import { Logger } from '@nestjs/common';
import { SuccessInterface } from '../common/ResponseHandler';
import { EnrollmentsService } from './enrollments.service';
import { GetCSVDto } from '../common/dto/getCSV.dto';
import { GetCountDto } from '../common/dto/getCount.dto';
import { SuspendLearnerDto } from './dto/suspendLearner.dto';
import { CourseIdDto } from '../common/dto/courseId.dto';
import { ChangeEnrollmentStatusDto } from './dto/changeEnrollmentStatus.dto';
import { EnrollmentIdDto } from '../common/dto/enrollmentId.dto';
import { RejectEnrollmentDto } from './dto/rejectEnrollment.dto';
import { LearnersService } from '../learners/learners.service';
import { UpdateLearnerEnrollmentActivityDto } from './dto/updateLearnerEnrollmentActivity.dto';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    private readonly learnersService;
    constructor(enrollmentsService: EnrollmentsService, learnersService: LearnersService);
    logger: Logger;
    rejectEnrollment(rejectEnrollmentDto: RejectEnrollmentDto, enrollmentIdDto: EnrollmentIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    rejectEnrollmentByExternalUser(rejectEnrollmentDto: RejectEnrollmentDto, enrollmentIdDto: EnrollmentIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    ChangeLearnerEnrollmentStatus(changeEnrollmentStatusDto: ChangeEnrollmentStatusDto, user: any): Promise<SuccessInterface>;
    ChangeLearnerEnrollmentStatusByExternalUser(changeEnrollmentStatusDto: ChangeEnrollmentStatusDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateLearnerEnrollmentActivityByExternalUser(updateLearnerEnrollmentActivityDto: UpdateLearnerEnrollmentActivityDto, enrollmentIdDto: EnrollmentIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    SuspendLearnerEnrollment(suspendLearnerDto: SuspendLearnerDto, user: any): Promise<SuccessInterface>;
    getEnrolledLearnerDetails(enrollmentIdDto: EnrollmentIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnersCount(getCountDto: GetCountDto, user: any): Promise<SuccessInterface>;
    getLearnersGrowth(getCountDto: GetCountDto, user: any): Promise<SuccessInterface>;
    GetTotalEnrollmentsAllowed(courseIdDto: CourseIdDto): Promise<SuccessInterface>;
    getLearnersInCSV(getCsvDto: GetCSVDto, user: any): Promise<any>;
}
