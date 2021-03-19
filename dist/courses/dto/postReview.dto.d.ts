import { RatingDto } from './rating.dto';
export declare class PostReviewDto {
    courseId: string;
    ratings?: RatingDto[];
    review?: string;
}
