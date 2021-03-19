import { EmployerIndustriesService } from './employer-industries.service';
import { ListDto } from '../common/dto/list.dto';
import { CreateEmployerIndustryDto } from './dto/create-employer-industry.dto';
import { EmployerIndustryIdDto } from '../common/dto/employerIndustryId.dto';
import { GetAllIndustriesDto } from './dto/get-all-industries.dto';
export declare class EmployerIndustriesController {
    private readonly employerIndustriesService;
    constructor(employerIndustriesService: EmployerIndustriesService);
    createIndustry(createEmployerIndustryDto: CreateEmployerIndustryDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getIndustries(listDto: ListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAllIndustries(listDto: GetAllIndustriesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableIndustry(employerIndustryIdDto: EmployerIndustryIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    enableIndustry(employerIndustryIdDto: EmployerIndustryIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
