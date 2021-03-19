import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerAdminInvitationsService } from './employer-admin-invitations.service';
import { InviteEmployerAdminDto } from './dto/invite-employer-admin.dto';
import { ListDto } from '../common/dto/list.dto';
import { EmployerAdminInvitationIdDto } from '../common/dto/employerAdminInvitationId.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { StripeService } from '../stripe/stripe.service';
import { ChatService } from '../chat/chat.service';
export declare class EmployerAdminInvitationsController {
    private readonly employerAdminsService;
    private readonly employerAdminInvitationsService;
    private readonly stripeService;
    private readonly chatService;
    constructor(employerAdminsService: EmployerAdminsService, employerAdminInvitationsService: EmployerAdminInvitationsService, stripeService: StripeService, chatService: ChatService);
    getAdminInvitations(listDto: ListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getAdminInvitationsCsv(listDto: ListDto, user: any): Promise<any>;
    removeAdminInvitation(employerAdminInvitationIdDto: EmployerAdminInvitationIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    inviteEmployerAdmin(inviteEmployerAdminDto: InviteEmployerAdminDto, user: any): Promise<SuccessInterface>;
    resendInvitation(employerAdminInvitationIdDto: EmployerAdminInvitationIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
