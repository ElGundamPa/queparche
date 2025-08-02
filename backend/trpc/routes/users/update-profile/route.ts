import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { mockUsers } from "@/mocks/users";

const updateProfileSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  location: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

export default publicProcedure
  .input(updateProfileSchema)
  .mutation(({ input }) => {
    const userIndex = mockUsers.findIndex(u => u.id === input.userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    const { userId, ...updateData } = input;
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    return mockUsers[userIndex];
  });