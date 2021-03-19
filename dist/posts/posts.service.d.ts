import { Reply } from './replies.model';
import { CreatePostDto } from './dto/createPost.dto';
import { ReportPostDto } from './dto/reportPost.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateReportStatusDto } from './dto/updateReportStatus.dto';
export declare class PostsService {
    private readonly postModel;
    private readonly replyModel;
    private readonly postTagModel;
    private readonly postReportModel;
    private readonly counterModel;
    constructor(postModel: any, replyModel: any, postTagModel: any, postReportModel: any, counterModel: any);
    getTotalPostAndParticipants(): Promise<{
        totalParticipants: any;
        totalPosts: any;
    }>;
    createPost(postDto: CreatePostDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    editPost(postDto: any, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getPosts(params: any): Promise<{
        postList: any;
        totalPosts: any;
    }>;
    getPostById(postId: any): Promise<any>;
    getPostByNumId(numId: any): Promise<any>;
    addReply(replyDto: Reply): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    editReply(replyDto: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReplies(params: any): Promise<{
        repliesList: any;
        totalReplies: any;
    }>;
    getRecentReplies(params: any): Promise<any>;
    deletePost(postDto: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteReply(replyDto: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getTags(): Promise<any>;
    addTag(tagDto: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getReports(params: PaginationDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addReport(params: ReportPostDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    updateReportStatus(params: UpdateReportStatusDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
