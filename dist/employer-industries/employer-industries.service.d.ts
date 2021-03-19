import { ListDto } from '../common/dto/list.dto';
import { CreateEmployerIndustryDto } from './dto/create-employer-industry.dto';
import { GetAllIndustriesDto } from './dto/get-all-industries.dto';
export declare class EmployerIndustriesService {
    private readonly employerIndustryModel;
    constructor(employerIndustryModel: any);
    createIndustry(industry: CreateEmployerIndustryDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAllIndustries(params: GetAllIndustriesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getIndustries(params: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableIndustry(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    enableIndustry(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
