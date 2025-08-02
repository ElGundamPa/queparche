import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    planId: "1",
    userId: "2",
    userName: "María González",
    userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1c2?q=80&w=1000",
    rating: 5,
    comment: "¡Increíble experiencia en Parque Arví! La naturaleza es espectacular y el guía muy conocedor.",
    createdAt: "2025-07-16T10:00:00Z",
    isVerified: true,
  },
  {
    id: "2",
    planId: "1",
    userId: "3",
    userName: "Carlos Rodríguez",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000",
    rating: 4,
    comment: "Muy buen tour, aunque el clima estuvo un poco nublado. Recomendado para los amantes de la naturaleza.",
    createdAt: "2025-07-17T14:30:00Z",
    isVerified: false,
  },
];

export default publicProcedure
  .input(z.object({ planId: z.string() }))
  .query(({ input }) => {
    return mockReviews.filter(review => review.planId === input.planId);
  });