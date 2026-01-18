export interface PlanLocation {
  address?: string;
  city?: string;
  zone?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

export interface Plan {
  id: string;
  name: string;
  primaryCategory: "barrio" | "mirador" | "rooftop" | "restaurante" | "cafe" | "bar" | "club" | "parque";

  location: PlanLocation;

  description: string;

  capacity: number;
  currentAttendees: number;
  eventDate?: string;
  averagePrice: number;
  categories: string[];

  maxPeople?: number;
  currentPeople?: number;

  date?: string | null;
  priceAvg?: string;

  tags?: string[];
  images: string[];
  rating?: number;
  reviews?: Array<{
    user: string;
    comment: string;
    rating: number;
  }>;

  // Campos legacy opcionales para compatibilidad
  category?: string;
  createdAt?: string | number;
  createdBy?: string;
  userId?: string;
  likes?: number;
  favorites?: number;
  reviewCount?: number;
  isPremium?: boolean;
  isSponsored?: boolean;
  price?: number;
  priceType?: 'free' | 'paid' | 'minimum_consumption' | string;
  endDate?: string;
  vibe?: string;
  bestTime?: string;
  isSpotlight?: boolean;
  visits?: number;
  saves?: number;
}

export interface Short {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  placeName: string;
  category: string;
  description: string;
  likes: number;
  favorites: number;
  comments: number;
  createdAt: string;
  createdBy: string;
  userId: string;
  isPremium?: boolean;
  isSponsored?: boolean;
  businessId?: string;
}

export interface Review {
  id: string;
  planId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface PlanComment {
  id: string;
  planId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: PlanLocation;
  startDate: string;
  endDate: string;
  image: string;
  price?: number;
  maxAttendees?: number;
  currentAttendees: number;
  organizerId: string;
  organizerName: string;
  tags: string[];
  isPremium?: boolean;
  isFeatured?: boolean;
  rating?: number;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color?: string;
};