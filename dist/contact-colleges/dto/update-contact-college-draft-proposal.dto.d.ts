import CoordinatesDto from '../../common/dto/coordinates.dto';
export declare class UpdateContactCollegeDraftProposalDto {
    emptyAttachments?: boolean;
    title: string;
    category: string;
    subCategory: string;
    description?: string;
    attachments: any;
    previousAttachments: string[];
    visibility: 'all' | 'selected';
    colleges: string[];
    locations: string[];
    coordinates?: CoordinatesDto[];
    employer?: string;
    addedBy?: string;
}
