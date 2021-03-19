import { EmailLog, Portal } from './email-logs.model';
export declare class EmailLogsService {
    private readonly emailLogModel;
    constructor(emailLogModel: any);
    createEmailLog(emailLog: EmailLog, portal: Portal): Promise<boolean>;
}
