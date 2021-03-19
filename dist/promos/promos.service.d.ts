import { Promo } from './promo.model';
import { PromoListDto } from './dto/promoList.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CoursePromoDataDto } from '../courses/dto/coursePromoData.dto';
export declare class PromosService {
    private readonly promoModel;
    private readonly enrollmentModel;
    private readonly notificationsService;
    constructor(promoModel: any, enrollmentModel: any, notificationsService: NotificationsService);
    createPromo(promo: Promo, notify?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updatePromo(promo: Promo): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateSuspendedStatus(promo: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deletePromo(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPromoById(promoId: string): Promise<any>;
    getPromoDetails(promoId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPromos(params: PromoListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPromosCsv(params: PromoListDto): Promise<any>;
    getPromosCount(params: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPromoHistory(promoId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCoursePromos(params: CoursePromoDataDto, price: any): Promise<{
        promos: any;
        promosCount: any;
    }>;
    getAppliedPromos(params: CoursePromoDataDto, price: number): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
