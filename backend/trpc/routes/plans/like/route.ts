import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockPlans } from "@/mocks/plans";

export default publicProcedure
  .input(z.object({ planId: z.string() }))
  .mutation(({ input }) => {
    const planIndex = mockPlans.findIndex(p => p.id === input.planId);
    if (planIndex === -1) {
      throw new Error("Plan not found");
    }
    
    mockPlans[planIndex] = {
      ...mockPlans[planIndex],
      likes: mockPlans[planIndex].likes + 1,
    };
    
    return mockPlans[planIndex];
  });