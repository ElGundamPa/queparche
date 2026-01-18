import { createTRPCRouter } from "./create-context";

// Plans routes
import getAllPlans from "./routes/plans/get-all/route";
import getPlanById from "./routes/plans/get-by-id/route";
import createPlan from "./routes/plans/create/route";
import joinPlan from "./routes/plans/join/route";
import likePlan from "./routes/plans/like/route";

// Shorts routes
import getAllShorts from "./routes/shorts/get-all/route";
import getShortById from "./routes/shorts/get-by-id/route";
import createShort from "./routes/shorts/create/route";
import likeShort from "./routes/shorts/like/route";
import favoriteShort from "./routes/shorts/favorite/route";

// Comments routes
import getCommentsByShort from "./routes/comments/get-by-short/route";
import createComment from "./routes/comments/create/route";
import getCommentsByPlan from "./routes/comments/get-by-plan/route";
import createPlanComment from "./routes/comments/create-plan-comment/route";

// Reviews routes
import getReviewsByPlan from "./routes/reviews/get-by-plan/route";

// Users routes
import getUserProfile from "./routes/users/get-profile/route";
import updateUserProfile from "./routes/users/update-profile/route";
import getUserStats from "./routes/users/get-stats/route";

// Auth routes
import login from "./routes/auth/login/route";
import register from "./routes/auth/register/route";

export const appRouter = createTRPCRouter({
  plans: createTRPCRouter({
    getAll: getAllPlans,
    getById: getPlanById,
    create: createPlan,
    join: joinPlan,
    like: likePlan,
  }),
  shorts: createTRPCRouter({
    getAll: getAllShorts,
    getById: getShortById,
    create: createShort,
    like: likeShort,
    favorite: favoriteShort,
  }),
  comments: createTRPCRouter({
    getByShort: getCommentsByShort,
    create: createComment,
    getByPlan: getCommentsByPlan,
    createPlanComment: createPlanComment,
  }),
  reviews: createTRPCRouter({
    getByPlan: getReviewsByPlan,
  }),
  users: createTRPCRouter({
    getProfile: getUserProfile,
    updateProfile: updateUserProfile,
    getStats: getUserStats,
  }),
  auth: createTRPCRouter({
    login: login,
    register: register,
  }),
});

export type AppRouter = typeof appRouter;