import { Controller, Post, HttpCode, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { CourseSuggestionsService } from './course-suggestions.service';
import { AddCourseSuggestionDto } from './dto/addCourseSuggestion.dto';

@ApiTags('Course Suggestion')
@Controller('course-suggestions')
export class CourseSuggestionsController {
  constructor(private readonly courseSuggestionsService: CourseSuggestionsService) {}

  @ApiOperation({ summary: 'Add courses suggestion.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  @HttpCode(200)
  async AddCoursesToCart(@Body() addCourseSuggestionDto: AddCourseSuggestionDto, @Req() req) {
    addCourseSuggestionDto.learnerId = req.user ? req.user._id : null;
    return await this.courseSuggestionsService.addCourseSuggestion(addCourseSuggestionDto);
  }
}
