import { EnquiriesService } from './enquiries.service';
import { GetEnquiryMessagesDto } from './dto/getEnquiryMessages.dto';
import { AddLearnerEnquiryDto } from './dto/AddLearnerEnquiry.dto';
export declare class LearnerEnquiriesController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
    GetEnquiries(learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEnquiryMessages(getEnquiryMessagesDto: GetEnquiryMessagesDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddEnquiryMessage(addLearnerEnquiryDto: AddLearnerEnquiryDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
