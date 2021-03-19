import { SuccessInterface } from '../common/ResponseHandler';
import { ActivitiesService } from './activities.service';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
    getActivities(activityListDto: any): Promise<SuccessInterface>;
}
