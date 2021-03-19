import { PartnerGroupsService } from './partner-groups.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { AddPartnerGroupDto } from './dto/addPartnerGroup.dto';
import { UpdatePartnerGroupDto } from './dto/updatePartnerGroup.dto';
import { GroupIdDto } from './dto/groupIdDto.dto';
export declare class EmployerGroupsController {
    private readonly partnerGroupsService;
    constructor(partnerGroupsService: PartnerGroupsService);
    AddPartnerGroup(addPartnerGroupDto: AddPartnerGroupDto): Promise<SuccessInterface>;
    UpdatePartnerGroup(updatePartnerGroupDto: UpdatePartnerGroupDto): Promise<SuccessInterface>;
    GetAllPartnerGroup(): Promise<SuccessInterface>;
    DeletePartnerGroup(groupIdDto: GroupIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
