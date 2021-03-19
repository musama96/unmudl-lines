import { EmployerPostsService } from './employer-forums.service';
import { CreatePostDto } from './dto/createPost.dto';
import { EditPostDto } from './dto/editPost.dto';
import { PostListDto } from './dto/postsList.dto';
import { AddTagDto } from './dto/addTag.dto';
import { AddCommentDto } from './dto/addComment.dto';
import { EditCommentDto } from './dto/editComment.dto';
import { PostIdDto } from './dto/postId.dto';
import { CommentIdDto } from './dto/commentId.dto';
import { RepliesListDto } from './dto/repliesList.dto';
import { RecentRepliesDto } from './dto/recentReplies.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { StatsDto } from './dto/stats.dto';
import { AddReplyDto } from './dto/addReply.dto';
import { ReplyIdDto } from './dto/replyId.dto';
import { EditReplyDto } from './dto/editReply.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
export declare class EmployerPostsController {
    private readonly employerPostsService;
    constructor(employerPostsService: EmployerPostsService);
    GetLandingPageData(dashboardDto: DashboardDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPostsCount(statsDto: StatsDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddPost(createPostDto: CreatePostDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    EditPost(postIdDto: PostIdDto, editPostDto: EditPostDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPosts(postListDto: PostListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetPost(postIdDto: PostIdDto, repliesListDto: RepliesListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeletePost(postIdDto: PostIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddComment(addCommentDto: AddCommentDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    EditComment(commentIdDto: CommentIdDto, editCommentDto: EditCommentDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetReplies(postIdDto: PostIdDto, repliesListDto: RepliesListDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetRecentReplies(recentRepliesDto: RecentRepliesDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    DeleteComment(commentIdDto: CommentIdDto, user: any): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    GetTags(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    AddTag(addTagDto: AddTagDto, user: any): Promise<{
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
    EditReply(replyIdDto: ReplyIdDto, editReplyDto: EditReplyDto, user: any): Promise<{
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
}
