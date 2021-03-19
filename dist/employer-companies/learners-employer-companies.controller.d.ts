import { SuccessInterface } from '../common/ResponseHandler';
import { PaginationDto } from '../common/dto/pagination.dto';
import { EmployerCompaniesService } from './employer-companies.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerInvitationsService } from '../employer-invitations/employer-invitations.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class LearnersEmployerCompaniesController {
    private readonly employerCompaniesService;
    private readonly employerAdminsService;
    private readonly employerInvitationsService;
    private readonly notificationsService;
    constructor(employerCompaniesService: EmployerCompaniesService, employerAdminsService: EmployerAdminsService, employerInvitationsService: EmployerInvitationsService, notificationsService: NotificationsService);
    GetColleges(paginationDto: PaginationDto): Promise<SuccessInterface>;
}
