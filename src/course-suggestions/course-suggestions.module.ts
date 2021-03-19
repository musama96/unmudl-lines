import { Module, forwardRef } from '@nestjs/common';
import { CourseSuggestionsController } from './course-suggestions.controller';
import { CourseSuggestionsService } from './course-suggestions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSuggestionSchema } from './course-suggestion.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'course-suggestions', schema: CourseSuggestionSchema },
    ]),
    forwardRef(() => EmailLogsModule),
  ],
  controllers: [CourseSuggestionsController],
  providers: [CourseSuggestionsService],
})
export class CourseSuggestionsModule {}
