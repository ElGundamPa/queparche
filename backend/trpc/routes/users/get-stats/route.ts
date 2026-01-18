import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ ctx, input }) => {
    // Get user's profile stats
    const { data: profile, error } = await ctx.supabase
      .from('profiles')
      .select(`
        plans_created,
        plans_attended,
        followers_count,
        following_count,
        points,
        level
      `)
      .eq('id', input.userId)
      .single();

    if (error || !profile) {
      throw new Error("Usuario no encontrado");
    }

    // Get user's plans for additional stats
    const { data: userPlans } = await ctx.supabase
      .from('plans')
      .select('rating, primary_category, category')
      .eq('user_id', input.userId);

    // Calculate additional stats
    const totalLikes = 0; // Could query likes table if needed
    const averageRating = userPlans && userPlans.length > 0
      ? userPlans.reduce((sum, plan) => sum + (plan.rating || 0), 0) / userPlans.length
      : 0;

    // Get favorite categories
    const categoryCount: { [key: string]: number } = {};
    userPlans?.forEach(plan => {
      const categoryKey = plan.primary_category || plan.category || 'otros';
      categoryCount[categoryKey] = (categoryCount[categoryKey] || 0) + 1;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      totalPlans: profile.plans_created || 0,
      totalAttended: profile.plans_attended || 0,
      totalLikes,
      totalReviews: 0, // Could calculate from reviews table if needed
      averageRating,
      favoriteCategories,
      followersCount: profile.followers_count || 0,
      followingCount: profile.following_count || 0,
      points: profile.points || 0,
      level: profile.level || 1,
    };
  });