import { Injectable } from '@nestjs/common';
import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';
import { BlogsService } from '../blogs/blogs.service';
import ResponseHandler from '../common/ResponseHandler';
import { ContactCollegesService } from '../contact-colleges/contact-colleges.service';
import { EmployerPostsService } from '../employer-forums/employer-forums.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SourceTalentService } from '../source-talent/source-talent.service';
import { EmployerDashboardPaginationDto } from './dto/employerDashboardPagination.dto';
import { GetEmployerDashboardDto } from './dto/getEmployerDashboard.dto';
import { CollegesService } from '../colleges/colleges.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class EmployerDashboardService {
  constructor(
    private readonly sourceTalentService: SourceTalentService,
    private readonly collegesService: CollegesService,
    private readonly contactCollegesService: ContactCollegesService,
    private readonly blogsService: BlogsService,
    private readonly employerPostsService: EmployerPostsService,
    private readonly notificationsService: NotificationsService,
    private readonly employerSubscriptionsService: EmployerSubscriptionsService,
    @InjectModel('employer-companies') private readonly employerModel,
  ) {}

  async getCompleteDashboardData(params: GetEmployerDashboardDto) {
    const { employerId, countEnd, countStart, employerAdminId } = params;
    const [
      { data: activeSourceTalents },
      { data: activeCollegeProposals },
      { data: blogPosts },
      { data: forumTopics },
      { data: sourceTalentActivities },
      { data: contactCollegeActivities },
      { data: employerForumActivities },
      { data: currentSubscriptionPlan },
    ] = await Promise.all([
      await this.sourceTalentService.getActiveSourceTalentRepliesCount(employerId, { start: countStart, end: countEnd }),
      await this.contactCollegesService.getActiveProposalsCount(employerId),
      await this.blogsService.getBlogPostsByEmployer(employerId),
      await this.employerPostsService.getForumTopics(employerId),
      await this.notificationsService.getSourceTalentActivity({
        user: employerAdminId,
        userType: 'employerAdmin',
        page: 1,
        perPage: 4,
        sortBy: 'createdAt',
        sortOrder: -1,
      }),
      await this.notificationsService.getContactCollegesActivity({
        user: employerAdminId,
        userType: 'employerAdmin',
        page: 1,
        perPage: 3,
        sortBy: 'createdAt',
        sortOrder: -1,
      }),
      await this.notificationsService.getEmployerForumActivity({
        user: employerAdminId,
        userType: 'employerAdmin',
        page: 1,
        perPage: 4,
        sortBy: 'createdAt',
        sortOrder: -1,
      }),
      await this.employerSubscriptionsService.getEmployerCurrentSubscriptionPlan(employerId),
    ]);

    let subscription = null;
    if (currentSubscriptionPlan) {
      subscription = currentSubscriptionPlan.toObject();
      switch (currentSubscriptionPlan.activePlan.level) {
        case 0:
          subscription.connectedColleges = currentSubscriptionPlan.connectedCollege ? [currentSubscriptionPlan.connectedCollege] : [];
          delete subscription.connectedCollege;
          break;
        case 1:
          if (currentSubscriptionPlan.connectedState.shortName) {
            const { data: colleges } = await this.collegesService.getCollegesByStateShortNameForEmployerSubscriptions(
              currentSubscriptionPlan.connectedState.shortName,
            );
            subscription.connectedColleges = colleges;
          } else {
            subscription.connectedColleges = [];
          }
          break;
        case 2:
          const { data: colleges } = await this.collegesService.getCollegesByStateShortNameForEmployerSubscriptions('');
          subscription.connectedColleges = colleges;
          break;
      }
    }

    return ResponseHandler.success({
      counts: { activeSourceTalents, activeCollegeProposals, blogPosts, forumTopics },
      sourceTalentActivities,
      contactCollegeActivities,
      employerForumActivities,
      currentSubscriptionPlan: subscription,
    });
  }

  async getContactCollegeActivity(params: EmployerDashboardPaginationDto) {
    const { employerAdminId, page, perPage } = params;

    const { data: contactCollegeActivities } = await this.notificationsService.getContactCollegesActivity({
      user: employerAdminId,
      userType: 'employerAdmin',
      page,
      perPage,
      sortBy: 'createdAt',
      sortOrder: -1,
    });

    return ResponseHandler.success(contactCollegeActivities);
  }

  async getSourceTalentActivity(params: EmployerDashboardPaginationDto) {
    const { employerAdminId, page, perPage } = params;

    const { data: sourceTalentActivities } = await this.notificationsService.getSourceTalentActivity({
      user: employerAdminId,
      userType: 'employerAdmin',
      page,
      perPage,
      sortBy: 'createdAt',
      sortOrder: -1,
    });

    return ResponseHandler.success(sourceTalentActivities);
  }

  async getEmployerForumActivity(params: EmployerDashboardPaginationDto) {
    const { employerAdminId, page, perPage } = params;

    const { data: sourceTalentActivities } = await this.notificationsService.getEmployerForumActivity({
      user: employerAdminId,
      userType: 'employerAdmin',
      page,
      perPage,
      sortBy: 'createdAt',
      sortOrder: -1,
    });

    return ResponseHandler.success(sourceTalentActivities);
  }

  async getDashboardMetrics(params: GetEmployerDashboardDto) {
    const { employerId, countEnd, countStart } = params;
    const [
      { data: activeSourceTalents },
      { data: activeCollegeProposals },
      { data: blogPosts },
      { data: forumTopics },
    ] = await Promise.all([
      await this.sourceTalentService.getActiveSourceTalentRepliesCount(employerId, { start: countStart, end: countEnd }),
      await this.contactCollegesService.getActiveProposalsCount(employerId),
      await this.blogsService.getBlogPostsByEmployer(employerId),
      await this.employerPostsService.getForumTopics(employerId),
    ]);

    return ResponseHandler.success({ activeSourceTalents, activeCollegeProposals, blogPosts, forumTopics });
  }
}
