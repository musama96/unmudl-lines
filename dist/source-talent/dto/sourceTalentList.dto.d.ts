import { SourceTalentType } from './createSourceTalent.dto';
export declare class SourceTalentListDto {
    keyword?: string;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: string;
    employerId?: string;
    type?: SourceTalentType;
}
