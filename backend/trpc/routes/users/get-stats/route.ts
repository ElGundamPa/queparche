import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockPlans } from "@/mocks/plans";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }) => {
    const userPlans = mockPlans.filter(p => p.userId === input.userId);
    const totalLikes = userPlans.reduce((sum, plan) => sum + plan.likes, 0);
    const totalReviews = userPlans.reduce((sum, plan) => sum + plan.reviewCount, 0);
    const averageRating = userPlans.length > 0 
      ? userPlans.reduce((sum, plan) => sum + plan.rating, 0) / userPlans.length 
      : 0;
    
    // Mock favorite categories based on user's plans
    const categoryCount: { [key: string]: number } = {};
    userPlans.forEach(plan => {
      categoryCount[plan.category] = (categoryCount[plan.category] || 0) + 1;
    });
    
    const favoriteCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      totalPlans: userPlans.length,
      totalAttended: 47, // Mock data
      totalLikes,
      totalReviews,
      averageRating,
      favoriteCategories,
    };
  });