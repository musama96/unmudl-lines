import { CreateLogDto } from './dto/createLog.dto';
export declare class UnmudlAccessLogsService {
    private readonly unmudlAccessLogModel;
    constructor(unmudlAccessLogModel: any);
    createLog(log: CreateLogDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
