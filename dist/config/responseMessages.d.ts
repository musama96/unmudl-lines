declare const _default: {
    success: {
        updateUser: string;
        registerdUser: string;
        updateCollege: string;
        updateEmployerCompany: string;
        updatePreferences: string;
        updatePassword: string;
        updatePromo: string;
        deletePromo: string;
        enrollmentAdded: string;
        enrollmentRequestAdded: string;
        giftedCourse: string;
        invitationSent: string;
        invitationAccepted: string;
        updateCourseInstructors: string;
        updateBlogStatus: string;
        updateBlog: string;
        deleteBlog: string;
        restoreBlog: string;
        deleteInstructor: string;
        publishedStatus: (status: any) => string;
        updatePartnerRequestStatus: (status: any) => string;
        deleteBugReport: string;
        reviewBugReport: string;
        createBugReport: string;
        createRefundRequest: string;
        rejectRefundRequest: string;
        changeEnrollmentStatus: (status: any) => string;
    };
    common: {
        requiredToken: string;
        invalidDiscount: string;
        invalidNoOfUses: string;
        incorrectPassword: string;
        notSocialLogin: string;
        fieldValidationError: string;
        invalidEmail: string;
        invalidStartDate: string;
        invalidEndDate: string;
        invalidExpiryDate: string;
        invalidInterval: string;
        invalidCollegeId: string;
        invalidEmployerId: string;
        invalidEmployerAdminId: string;
        invalidEmployerAdminIds: string;
        invalidEmployerAdminInvitationId: string;
        invalidContactCollegeProposalId: string;
        invalidPartnerGroupId: string;
        invalidKeyword: string;
        invalidLearnerSearchBy: string;
        invalidPage: string;
        invalidPerPage: string;
        invalidLearnerId: string;
        invalidLearnerIds: string;
        invalidUserId: string;
        invalidUserIds: string;
        invalidSourceTalentId: string;
        invalidGiftId: string;
        invalidCourseId: string;
        invalidCourseDraftId: string;
        invalidCourseIds: string;
        invalidInstructorId: string;
        invalidInstructorIds: string;
        invalidStateId: string;
        invalidCategoryId: string;
        invalidSubCategoryId: string;
        invalidCountryId: string;
        invalidPromo: string;
        invalidPromoId: string;
        invalidBlogId: string;
        invalidBugReportId: string;
        invalidRefundRequestId: string;
        invalidChatId: string;
        invalidReportedActivityId: string;
        invalidEmployerIndustriesArray: string;
        partnerRequestId: string;
        emailRegistered: string;
        phoneNumberRegistered: string;
        requiredCollegeId: string;
        onlyUnmudlAdminAllowed: string;
        endDate: string;
        blogStatus: string;
        endTime: string;
        time: string;
        invalidStatsFilter: string;
        invalidRefundRate: string;
        invalidRejectionRate: string;
        invalidRevenueSort: string;
        invalidSort: string;
        invalidSortBy: string;
        invalidSortOrder: string;
        invalidEnrolledStatus: string;
        invalidLat: string;
        invalidLng: string;
        invalidToken: string;
        invalidClientId: string;
        invalidEnrollmentId: string;
        invalidReviewId: string;
        invalidContactTime: string;
        invalidUserType: string;
        invitationId: string;
        invalidPhoneNumber: string;
        invalidEnquiryId: string;
        invalidProposalResponseId: string;
        requiredMessage: string;
        invalidDateOfBirth: string;
        invalidEmployerSubscriptionPlanId: string;
    };
    login: {
        unverified: string;
        pendingInvite: string;
        suspended: string;
    };
    authCredentials: {
        invalidEmail: string;
        emptyPassword: string;
        invalidPassword: string;
    };
    contact: {
        invalidEmail: string;
        invalidContactNumber: string;
        invalidContactName: string;
    };
    coordinates: {
        invalidType: string;
        invalidArray: string;
        invalidLatLng: string;
    };
    url: {
        invalidWebsiteUrl: string;
        invalidFacebookUrl: string;
        invalidTwitterUrl: string;
        invalidLinkedInUrl: string;
    };
    createCollege: {
        invalidEmail: string;
        emptyPassword: string;
        invalidPassword: string;
        fullname: string;
    };
    enrollments: {
        invalidStatus: string;
    };
    learners: {
        invalidNote: string;
    };
    setEnrollment: {
        courseId: string;
        status: string;
    };
    createReviewCategoryDto: {
        title: string;
        question: string;
    };
    createReviewCategory: {
        title: string;
    };
    createPromo: {
        applyTo: string;
        duration: string;
        type: string;
        status: string;
        invalidPromoDiscount: string;
        invalidPromo: string;
        discountMetric: string;
        coursesRequired: string;
    };
    deletePromo: {
        alreadyUsed: string;
        notFound: string;
    };
    createCourse: {
        invalidVenue: string;
        invalidRelatedCredentials: string;
        invalidHoursOffered: string;
        invalidPerformanceOutcome: string;
        invalidEmployerId: string;
    };
    editCourse: {
        wrongCollege: string;
        wrongCourse: string;
        courseNotFound: string;
    };
    createUser: {
        invalidFullName: string;
        invalidDesignation: string;
        invalidEmail: string;
        invalidPassword: string;
        invalidRole: string;
    };
    updateUser: {
        invalidFullName: string;
        invalidDesignation: string;
        invalidEmail: string;
        invalidPassword: string;
        invalidOldPassword: string;
        emptyPassword: string;
        emailPreference: string;
        enrollmentPreference: string;
        refundPreference: string;
        newNotificationPreference: string;
        buyCoursePreference: string;
        linkedIn: string;
        contactNumber: string;
        city: string;
        street: string;
    };
    createEnrollment: {
        discountPercentage: string;
        discountTotal: string;
        salesTax: string;
        taxPercentage: string;
        totalPaid: string;
        totalRevenue: string;
        unmudlSharePercentage: string;
        unmudlShare: string;
        collegeShare: string;
        stripeFee: string;
        courseFee: string;
        status: string;
        alreadyEnrolled: string;
        stripeCustomerId: string;
    };
    inviteEmployerAdmin: {
        role: string;
        adminAlreadyRegistered: string;
    };
    inviteUser: {
        fullname: string;
        emailAddress: string;
        role: string;
        userAlreadyRegistered: string;
        invitationPresent: string;
        courseAdded: string;
        invalidDomain: string;
    };
    createBlog: {
        title: string;
        altText: string;
        contributors: string;
        employerContributors: string;
        permalink: string;
        content: string;
        tags: string;
        status: string;
        featured: string;
    };
    post: {
        tags: string;
        postId: string;
        replyId: string;
        wrongAuthor: string;
        editReply: string;
    };
    updateBlog: {
        publishedStatus: string;
        notFound: string;
        trashedNotFound: string;
    };
    updateRole: {
        invalidRole: string;
    };
    access: {
        superadmin: string;
        college: string;
        employer: string;
        higherRole: string;
    };
    activities: {
        type: string;
    };
    createLearner: {
        emailSent: string;
        messageSent: string;
        emailError: string;
        messageError: string;
        invalidVerificationCode: string;
        verified: string;
        contact: string;
    };
    addPaymentMethod: {
        expMonth: string;
        expYear: string;
        number: string;
        cvc: string;
        name: string;
        email: string;
        address: string;
    };
    addTransaction: {
        amount: string;
        courseId: string;
    };
    addPartnerGroup: {
        color: string;
        title: string;
        id: string;
        titlePresent: string;
        colorPresent: string;
    };
    updatePartnerGroup: {
        doesNotExist: string;
    };
    unpublishCourse: {
        id: string;
        status: string;
    };
    createBlogTag: {
        title: string;
    };
    updateLanding: {
        title: string;
        tagLine: string;
        partners: string;
        blogs: string;
        featured: string;
        highlyRated: string;
    };
    postReview: {
        courseNotFinished: string;
        courseNotEnrolled: string;
        alreadyReviewed: string;
    };
    collegeRequest: {
        alreadyPending: string;
    };
    createBugReport: {
        title: string;
        severity: string;
    };
    createRefund: {
        enrollmentId: string;
        reason: string;
        noReasonSelected: string;
    };
    updatePartnerRequestStatus: {
        status: string;
    };
    addReportedActivity: {
        reportedLearnerId: string;
        reviewId: string;
    };
    resolveReportedActivity: {
        status: string;
    };
    updateLearnerEnrollmentActivity: {
        status: string;
        courseId: string;
        userId: string;
    };
    createContactCollegeCategory: {
        title: string;
        subcategoryTitleArr: string;
        subcategoryTitle: string;
    };
    createSourceTalent: {
        type: string;
    };
    addChat: {
        showToCreator: string;
        module: string;
        moduleDocumentId: string;
    };
    giftCourse: {
        email: string;
        name: string;
        message: string;
        alreadyGifted: string;
        giftCode: string;
    };
    createEmployerSubscription: {
        priceStripeId: string;
        stripeCardId: string;
    };
    approveRefund: {
        status(status: any): "You have already canceled the enrollment." | "You have already been declined to enroll in this course." | "You have already refunded.";
    };
    captureCharge: {
        status(status: any): "You have already captured the payment." | "The customer has canceled the enrollment." | "You have already declined the customer's request to enroll in this course." | "You have already refunded the amount.";
    };
    createContactCollegeProposal: {
        title: string;
        description: string;
    };
};
export default _default;
