import { AppService } from './app.service';
import { UploadImageDto } from './common/dto/uploadImage.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    UpdateUserDetails(uploadImageDto: UploadImageDto, files: any): Promise<{
        success: boolean;
        location: string;
    }>;
    HealthCheckAPIs(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
