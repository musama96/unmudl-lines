import { SourceTalentIdDto } from '../common/dto/sourceTalentId.dto';
import { CreateSourceTalentDto } from './dto/createSourceTalent.dto';
import { SourceTalentListDto } from './dto/sourceTalentList.dto';
import { SourceTalentService } from './source-talent.service';
export declare class SourceTalentController {
    private readonly sourceTalentService;
    constructor(sourceTalentService: SourceTalentService);
    createSourceTalent(createSourceTalentDto: CreateSourceTalentDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSourceTalentsList(sourceTalentListDto: SourceTalentListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getSourceTalentDetails(sourceTalentIdDto: SourceTalentIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    resendSourceTalentMessages(sourceTalentIdDto: SourceTalentIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteSourceTalent(sourceTalentIdDto: SourceTalentIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
