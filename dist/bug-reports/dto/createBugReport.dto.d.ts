import { Severity } from '../../common/enums/createBugReport.enum';
export declare class CreateBugReportDto {
    title: string;
    severity: Severity;
    description?: string;
    comment?: string;
    reportedBy?: string;
}
