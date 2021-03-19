import { ChatService } from '../chat/chat.service';
import { CreateSourceTalentDto } from './dto/createSourceTalent.dto';
import { SourceTalentListDto } from './dto/sourceTalentList.dto';
import { MailerService } from '@nest-modules/mailer';
import { UsersService } from '../users/users.service';
export declare class SourceTalentService {
    private readonly sourceTalentModel;
    private readonly courseModel;
    private readonly enrollmentModel;
    private readonly userModel;
    private readonly chatModel;
    private readonly employerModel;
    private readonly chatService;
    private readonly mailerService;
    private readonly usersService;
    constructor(sourceTalentModel: any, courseModel: any, enrollmentModel: any, userModel: any, chatModel: any, employerModel: any, chatService: ChatService, mailerService: MailerService, usersService: UsersService);
    getSourceTalentsList(params: SourceTalentListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getLearnerSourceTalentRequests(learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSourceTalentDetails(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getActiveSourceTalentRepliesCount(employerId: any, { start, end }: {
        start: any;
        end: any;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    resendSourceTalentMessages(id: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createSourceTalent(createSourceTalentDto: CreateSourceTalentDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteSourceTalent(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
