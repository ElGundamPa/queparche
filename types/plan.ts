export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Plan {
  id: string;
  name: string;
  location: Location;
  description: string;
  category: string;
  maxPeople: number;
  currentPeople: number;
  images: string[];
  createdAt: string;
  createdBy: string;
  userId: string;
  likes: number;
  favorites: number;
  rating: number;
  reviewCount: number;
  isPremium?: boolean;
  isSponsored?: boolean;
  price?: number;
  priceType?: 'free' | 'paid' | 'minimum_consumption';
  tags?: string[];
  eventDate?: string;
  endDate?: string;
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
  location: Location;
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
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color?: string;
};