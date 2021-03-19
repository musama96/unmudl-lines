import CoordinatesDto from '../../common/dto/coordinates.dto';
export declare class CreateContactCollegeProposalDto {
    draftProposalId?: string;
    emptyAttachments?: boolean;
    title: string;
    category: string;
    subCategory: string;
    description?: string;
    attachments: any;
    visibility: 'all' | 'selected';
    colleges: string[];
    locations: string[];
    showToEmployerAdmins?: string[];
    coordinates?: CoordinatesDto[];
    employer?: string;
    addedBy?: string;
}
