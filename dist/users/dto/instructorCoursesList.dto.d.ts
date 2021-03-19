import { InstructorCoursesColumns, InstructorCoursesOrder } from '../../common/enums/sort.enum';
export declare class InstructorCoursesListDto {
    userId: string;
    column: InstructorCoursesColumns;
    order: InstructorCoursesOrder;
    page: number;
    perPage: number;
}
