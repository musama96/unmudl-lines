import { EmployerRequestsService } from './employer-requests.service';
import { EmployerRequestDto } from './dto/employerRequest.dto';
export declare class LearnerEmployerRequestsController {
    private readonly employerRequestsService;
    constructor(employerRequestsService: EmployerRequestsService);
    CreateEmployerRequest(employerRequestDto: EmployerRequestDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
