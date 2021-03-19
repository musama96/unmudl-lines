import { CreateContactCollegeProposalDto } from './dto/create-contact-college-proposal.dto';
import { CreateContactCollegeDraftProposalDto } from './dto/create-contact-college-draft-proposal.dto';
import { ContactCollegesProposalsListDto } from './dto/contact-colleges-proposals-list.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CollegesService } from '../colleges/colleges.service';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nest-modules/mailer';
export declare class ContactCollegesService {
    private readonly employerModel;
    private readonly contactCollegeProposalModel;
    private readonly contactCollegeDraftProposalModel;
    private readonly notificationsService;
    private readonly collegesService;
    private readonly usersService;
    private readonly mailerService;
    constructor(employerModel: any, contactCollegeProposalModel: any, contactCollegeDraftProposalModel: any, notificationsService: NotificationsService, collegesService: CollegesService, usersService: UsersService, mailerService: MailerService);
    getProposalsForEmployer(params: ContactCollegesProposalsListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProposalDetailsForEmployer(proposalId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProposalsForCollege(params: ContactCollegesProposalsListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProposalDetailsForCollege(proposalId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getActiveProposalsCount(employerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createProposal(proposal: CreateContactCollegeProposalDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateProposal(id: string, proposal: CreateContactCollegeProposalDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableProposal(id: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    invertProposalStatus(id: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDraftProposals(params: ContactCollegesProposalsListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDraftProposalDetails(proposalId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createDraftProposal(draftProposal: CreateContactCollegeDraftProposalDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateDraftProposal(id: string, draftProposal: CreateContactCollegeDraftProposalDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableDraftProposal(id: string): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProposalById(id: any, lean?: boolean): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
