import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockShorts } from "@/mocks/shorts";

const createShortSchema = z.object({
  videoUrl: z.string(),
  thumbnailUrl: z.string(),
  placeName: z.string(),
  category: z.string(),
  description: z.string(),
  userId: z.string(),
  createdBy: z.string(),
});

export default publicProcedure
  .input(createShortSchema)
  .mutation(({ input }) => {
    const newShort = {
      id: (mockShorts.length + 1).toString(),
      ...input,
      likes: 0,
      favorites: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockShorts.push(newShort);
    return newShort;
  });