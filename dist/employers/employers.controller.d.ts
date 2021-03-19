import { EmployersService } from './employers.service';
import { AddEmployerDto } from './dto/addEmployers.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { KeywordDto } from '../common/dto/keyword.dto';
export declare class EmployersController {
    private readonly employersService;
    constructor(employersService: EmployersService);
    AddEmployers(addEmployerDto: AddEmployerDto, files: any): Promise<SuccessInterface>;
    GetEmployers(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetEmployersForFilter(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
