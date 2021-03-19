import { DurationDto } from '../../common/dto/duration.dto';
export declare class GetListDto {
    keyword: string;
    page: number;
    perPage: number;
    type?: string;
    status?: string;
    date: DurationDto;
    collegeId?: string;
    courseId?: string;
}
