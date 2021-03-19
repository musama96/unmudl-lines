import { ReportedActivitiesService } from './reported-activities.service';
import { ReportedActivitiesListDto } from './dto/reportedActivitiesList.dto';
import { AddReportDto } from './dto/addReport.dto';
import { CoursesService } from '../courses/courses.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { ReportedActivityIdDto } from '../common/dto/reportedActivityId.dto';
import { ResolveReportedActivityDto } from './dto/resolveReportedActivity.dto';
import { LearnersService } from '../learners/learners.service';
export declare class ReportedActivitiesController {
    private readonly reportedActivitiesService;
    private readonly learnersService;
    private readonly coursesService;
    constructor(reportedActivitiesService: ReportedActivitiesService, learnersService: LearnersService, coursesService: CoursesService);
    GetReportedActivities(reportedActivitiesListDto: ReportedActivitiesListDto): Promise<SuccessInterface>;
    GetReportedActivityDetails(reportedActivityIdDto: ReportedActivityIdDto): Promise<SuccessInterface>;
    AddReportedActivityByCollege(addReportDto: AddReportDto, user: any): Promise<SuccessInterface>;
    ResolveReportedActivity(resolveReportedActivityDto: ResolveReportedActivityDto, user: any): Promise<SuccessInterface>;
}
