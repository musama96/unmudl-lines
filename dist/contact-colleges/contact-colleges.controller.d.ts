import { ContactCollegesService } from './contact-colleges.service';
import { CreateContactCollegeProposalDto } from './dto/create-contact-college-proposal.dto';
import { CreateContactCollegeDraftProposalDto } from './dto/create-contact-college-draft-proposal.dto';
import { ContactCollegeProposalIdDto } from '../common/dto/contactCollegeProposalId.dto';
import { ContactCollegesProposalsListDto } from './dto/contact-colleges-proposals-list.dto';
import { UpdateContactCollegeProposalDto } from './dto/update-contact-college-proposal.dto';
import { UpdateContactCollegeDraftProposalDto } from './dto/update-contact-college-draft-proposal.dto';
export declare class ContactCollegesController {
    private readonly contactCollegesService;
    constructor(contactCollegesService: ContactCollegesService);
    getProposals(listDto: ContactCollegesProposalsListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getProposalDetails(contactCollegeProposalIdDto: ContactCollegeProposalIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createProposal(createContactCollegeProposalDto: CreateContactCollegeProposalDto, files: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateProposal(files: any, contactCollegeProposalIdDto: ContactCollegeProposalIdDto, updateContactCollegeProposalDto: UpdateContactCollegeProposalDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableProposal(contactCollegeProposalIdDto: ContactCollegeProposalIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    invertProposalStatus(contactCollegeProposalIdDto: ContactCollegeProposalIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDraftProposals(listDto: ContactCollegesProposalsListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getDraftProposalDetails(contactCollegeProposalIdDto: ContactCollegeProposalIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createDraftProposal(createContactCollegeProposalDto: CreateContactCollegeDraftProposalDto, files: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateDraftProposal(contactCollegeProposalIdDto: ContactCollegeProposalIdDto, updateContactCollegeDraftProposalDto: UpdateContactCollegeDraftProposalDto, files: any, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    disableDraftProposal(contactCollegeProposalIdDto: ContactCollegeProposalIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
