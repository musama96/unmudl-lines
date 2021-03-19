import { HoursOffered, RelatedCredentials } from '../courses.model';
import { Venue } from '../courses.model';
export declare enum CourseType {
    IN_DEMAND = "in demand",
    HIGHLY_RATED = "highly rated",
    ALL_COURSES = "all courses"
}
export declare enum LearnerCourseListSortBy {
    Relevance = "relevance",
    ComunityCollege = "communityCollege",
    HighestPrice = "highestPrice",
    LowestPrice = "lowestPrice",
    MostRecent = "mostRecent"
}
export declare enum Funding {
    WIOA = "WIOA",
    VETERAN_BENEFITS = "veteranBenefits"
}
export declare class LearnersCoursesListDto {
    keyword?: string;
    colleges?: string[];
    employers?: string[];
    collegeNames?: string[];
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    page?: number;
    perPage?: number;
    collegeId?: string;
    startDate?: string;
    endDate?: string;
    courseType?: Venue[];
    relatedCredentials?: RelatedCredentials[];
    funding?: Funding[];
    hoursOffered?: HoursOffered[];
    knowledgeOutcomes?: string[];
    categories?: string[];
    occupations?: string[];
    skillOutcomes?: string[];
    experiences?: string[];
    minEnrollments?: number;
    maxEnrollments?: number;
    lat?: number;
    lng?: number;
    sort?: LearnerCourseListSortBy;
    credits?: boolean;
    continuingCredits?: boolean;
}
