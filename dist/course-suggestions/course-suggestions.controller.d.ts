import { CourseSuggestionsService } from './course-suggestions.service';
import { AddCourseSuggestionDto } from './dto/addCourseSuggestion.dto';
export declare class CourseSuggestionsController {
    private readonly courseSuggestionsService;
    constructor(courseSuggestionsService: CourseSuggestionsService);
    AddCoursesToCart(addCourseSuggestionDto: AddCourseSuggestionDto, req: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
