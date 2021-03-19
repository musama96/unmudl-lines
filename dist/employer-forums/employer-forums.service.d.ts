import { CreatePostDto } from './dto/createPost.dto';
import { ReportPostDto } from './dto/reportPost.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateReportStatusDto } from './dto/updateReportStatus.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { AddReplyDto } from './dto/addReply.dto';
import { AddCommentDto } from './dto/addComment.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class EmployerPostsService {
    private readonly employerPostModel;
    private readonly employerCommentModel;
    private readonly employerReplyModel;
    private readonly employerPostTagModel;
    private readonly postReportModel;
    private readonly counterModel;
    private readonly notificationsService;
    constructor(employerPostModel: any, employerCommentModel: any, employerReplyModel: any, employerPostTagModel: any, postReportModel: any, counterModel: any, notificationsService: NotificationsService);
    getTotalPostsAndReplies({ start, end }: DashboardDto): Promise<{
        totalDiscussions: any;
        totalReplies: any;
    }>;
    createPost(postDto: CreatePostDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    editPost(postDto: any, user: any): Promise<{
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
    getPost(postId: any): Promise<any>;
    getForumTopics(employerId: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addComment(commentDto: AddCommentDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    addReply(replyDto: AddReplyDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    editComment(commentDto: any): Promise<{
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
    getComments(params: any): Promise<{
        commentsList: any;
        totalComments: any;
    }>;
    getRecentComments(params: any): Promise<any>;
    deletePost(postDto: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    deleteComment(commentDto: any): Promise<{
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
    getTags(keyword: any): Promise<any>;
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
