import { WhiteLabelBannersService } from './white-label-banners.service';
export declare class WhiteLabelBannersController {
    private readonly whiteLabelBannersService;
    constructor(whiteLabelBannersService: WhiteLabelBannersService);
    getSourceTalentsList(identifierDto: {
        identifier?: string;
    }): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
