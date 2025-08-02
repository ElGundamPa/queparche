import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockPlans } from "@/mocks/plans";

const createPlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  maxPeople: z.number(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }),
  images: z.array(z.string()),
  userId: z.string(),
  createdBy: z.string(),
});

export default publicProcedure
  .input(createPlanSchema)
  .mutation(({ input }) => {
    const newPlan = {
      id: (mockPlans.length + 1).toString(),
      ...input,
      currentPeople: 0,
      likes: 0,
      favorites: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockPlans.push(newPlan);
    return newPlan;
  });