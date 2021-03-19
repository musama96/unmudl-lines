import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { EditPostDto } from './dto/editPost.dto';
import { PostListDto } from './dto/postsList.dto';
import { AddTagDto } from './dto/addTag.dto';
import { AddReplyDto } from './dto/addReply.dto';
import { EditReplyDto } from './dto/editReply.dto';
import { PostIdDto } from './dto/postId.dto';
import { ReplyIdDto } from './dto/replyId.dto';
import { RepliesListDto } from './dto/repliesList.dto';
import { RecentRepliesDto } from './dto/recentReplies.dto';
import { LandingPageDto } from './dto/landingPage.dto';
import { ReportPostDto } from './dto/reportPost.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateReportStatusDto } from './dto/updateReportStatus.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    GetLandingPageData(landingPageDto: LandingPageDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPostsCount(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddPost(createPostDto: CreatePostDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    EditPost(editPostDto: EditPostDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPosts(postListDto: PostListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPost(repliesListDto: RepliesListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeletePost(postIdDto: PostIdDto, learner: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddReply(addReplyDto: AddReplyDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    EditReply(editReplyDto: EditReplyDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetReplies(repliesListDto: RepliesListDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetRecentReplies(recentRepliesDto: RecentRepliesDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeleteReply(replyIdDto: ReplyIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetTags(): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddTag(addTagDto: AddTagDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetReport(paginationDto: PaginationDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddReport(reportPostDto: ReportPostDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    UpdateReportStatus(updateReportStatusDto: UpdateReportStatusDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
