import { InviteUserDto } from './dto/inviteUser.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { InvitationsService } from './invitations.service';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { CollegesService } from '../colleges/colleges.service';
import { UserTokensService } from '../users/userTokens.service';
import { InvitationIdDto } from './dto/invitationId.dto';
import { ActivitiesService } from '../activities/activities.service';
export declare class InvitationsController {
    private readonly invitationsService;
    private readonly usersService;
    private readonly coursesService;
    private readonly collegesService;
    private readonly userTokensService;
    private readonly activitiesService;
    constructor(invitationsService: InvitationsService, usersService: UsersService, coursesService: CoursesService, collegesService: CollegesService, userTokensService: UserTokensService, activitiesService: ActivitiesService);
    InviteUser(inviteUserDto: InviteUserDto, user: any): Promise<SuccessInterface>;
    ResendInvite(invitationIdDto: InvitationIdDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
