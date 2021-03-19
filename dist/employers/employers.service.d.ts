import { Employer } from './employer.model';
export declare class EmployersService {
    private readonly employerModel;
    constructor(employerModel: any);
    createEmployers(employersArr: Employer[]): Promise<any>;
    getEmployers(keyword: string): Promise<any>;
    getEmployersForFilter(params: any): Promise<any>;
}
