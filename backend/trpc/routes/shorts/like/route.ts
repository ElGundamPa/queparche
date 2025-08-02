import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockShorts } from "@/mocks/shorts";

export default publicProcedure
  .input(z.object({ shortId: z.string() }))
  .mutation(({ input }) => {
    const shortIndex = mockShorts.findIndex(s => s.id === input.shortId);
    if (shortIndex === -1) {
      throw new Error("Short not found");
    }
    
    mockShorts[shortIndex] = {
      ...mockShorts[shortIndex],
      likes: mockShorts[shortIndex].likes + 1,
    };
    
    return mockShorts[shortIndex];
  });