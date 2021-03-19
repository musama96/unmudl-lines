import { PromosService } from './promos.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { CreatePromoDto } from './dto/createPromo.dto';
import { PromoIdDto } from '../common/dto/promoId.dto';
import { UpdatePromoDto } from './dto/updatePromo.dto';
import { SuspendPromoDto } from './dto/suspendPromo.dto';
import { PromoListDto } from './dto/promoList.dto';
export declare class PromosController {
    private readonly promosService;
    constructor(promosService: PromosService);
    GetPromos(promoListDto: PromoListDto, user: any): Promise<SuccessInterface>;
    GetPromosCsv(promoListDto: PromoListDto, user: any): Promise<SuccessInterface>;
    GetCompletePromosSectionData(promoListDto: PromoListDto, user: any): Promise<SuccessInterface>;
    CreatePromo(createPromoDto: CreatePromoDto, user: any): Promise<SuccessInterface>;
    UpdatePromo(updatePromoDto: UpdatePromoDto, user: any): Promise<SuccessInterface>;
    UpdateSuspendedStatus(suspendPromoDto: SuspendPromoDto, user: any): Promise<SuccessInterface>;
    DeletePromo(promoIdDto: PromoIdDto): Promise<SuccessInterface>;
    GetPromoDetails(promoIdDto: PromoIdDto, user: any): Promise<SuccessInterface>;
    GetPromoHistory(promoIdDto: PromoIdDto, user: any): Promise<SuccessInterface>;
}
