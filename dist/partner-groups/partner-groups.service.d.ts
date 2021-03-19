import { PartnerGroupInterface } from './partner-group.model';
import { SuccessInterface } from '../common/ResponseHandler';
export declare class PartnerGroupsService {
    private readonly partnerGroupModel;
    private readonly employerGroupModel;
    private readonly collegeModel;
    private readonly employerModel;
    constructor(partnerGroupModel: any, employerGroupModel: any, collegeModel: any, employerModel: any);
    addPartnerGroup(group: PartnerGroupInterface): Promise<SuccessInterface>;
    addEmployerGroup(group: PartnerGroupInterface): Promise<SuccessInterface>;
    updatePartnerGroup(group: PartnerGroupInterface): Promise<SuccessInterface>;
    updateEmployerGroup(group: PartnerGroupInterface): Promise<SuccessInterface>;
    getAllPartnerGroup(): Promise<SuccessInterface>;
    getAllEmployerGroup(): Promise<SuccessInterface>;
    getPartnerGroupByTitle(title: string): Promise<SuccessInterface>;
    getPartnerGroupByHex(color: string): Promise<SuccessInterface>;
    getEmployerGroupByTitle(title: string): Promise<SuccessInterface>;
    getEmployerGroupByHex(color: string): Promise<SuccessInterface>;
    deleteGroup(groupId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteEmployerGroup(groupId: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
