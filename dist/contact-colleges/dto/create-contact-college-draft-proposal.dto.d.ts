import CoordinatesDto from '../../common/dto/coordinates.dto';
export declare class CreateContactCollegeDraftProposalDto {
    proposalId?: string;
    emptyAttachments?: boolean;
    title: string;
    category: string;
    subCategory: string;
    description?: string;
    attachments: any;
    visibility: 'all' | 'selected';
    colleges: string[];
    locations: string[];
    coordinates?: CoordinatesDto[];
    employer?: string;
    addedBy?: string;
}
