import { HttpService } from '@nestjs/common';
import { ListDto } from '../common/dto/list.dto';
export declare class ExternalController {
    private readonly httpService;
    constructor(httpService: HttpService);
    fetchTitlesFromCollegeScorecard(listDto: ListDto): Promise<any>;
}
