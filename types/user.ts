export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
  isPremium?: boolean;
  points: number;
  level: number;
  badges: string[];
  followersCount: number;
  followingCount: number;
  plansCreated: number;
  plansAttended: number;
}

export interface UserStats {
  totalPlans: number;
  totalAttended: number;
  totalLikes: number;
  totalReviews: number;
  averageRating: number;
  favoriteCategories: string[];
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  shortId?: string;
  planId?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

export interface Like {
  id: string;
  userId: string;
  shortId?: string;
  planId?: string;
  commentId?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  shortId?: string;
  planId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'plan_join' | 'plan_reminder' | 'friend_request';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  planId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'location';
  createdAt: string;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  isRead: boolean;
  createdAt: string;
}