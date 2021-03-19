import { ReportedActivitiesService } from './reported-activities.service';
import { AddReportDto } from './dto/addReport.dto';
import { CoursesService } from '../courses/courses.service';
export declare class LearnerReportedActivitiesController {
    private readonly reportedActivitiesService;
    private readonly coursesService;
    constructor(reportedActivitiesService: ReportedActivitiesService, coursesService: CoursesService);
    AddReportedActivityByLearner(addReportDto: AddReportDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
