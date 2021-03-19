import { AddCourseSuggestionDto } from './dto/addCourseSuggestion.dto';
import { MailerService } from '@nest-modules/mailer';
import { EmailLogsService } from '../email-logs/email-logs.service';
export declare class CourseSuggestionsService {
    private readonly courseSuggetsionModel;
    private readonly mailerService;
    private readonly emailLogsService;
    constructor(courseSuggetsionModel: any, mailerService: MailerService, emailLogsService: EmailLogsService);
    addCourseSuggestion(courseSuggestion: AddCourseSuggestionDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
