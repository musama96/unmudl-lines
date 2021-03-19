export declare class WhiteLabelBannersService {
    private readonly whiteLabelBannerModel;
    constructor(whiteLabelBannerModel: any);
    getWhiteLabelBanner(identifier: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
