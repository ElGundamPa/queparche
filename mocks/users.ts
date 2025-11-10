import { User } from "@/types/user";

export const mockUsers: User[] = [
  {
    id: "admin-user",
    name: "Admin",
    username: "@admin",
    email: "admin@admin",
    password: "123456",
    avatar: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    createdAt: new Date().toISOString(),
    bio: "Cuenta de administrador para pruebas.",
    isPremium: true,
    isVerified: true,
    followersCount: 0,
    followingCount: 0,
    points: 0,
    level: 1,
    badges: [],
    interests: ["nightlife", "rooftop"],
    preferences: [],
    plansCreated: 0,
    plansAttended: 0,
    location: "Medellín, Colombia",
  },
  {
    id: "1",
    name: "Usuario Demo",
    username: "usuario",
    email: "usuario@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000",
    bio: "Explorer | Food lover | Always looking for new adventures in Medellín 🌟",
    location: "Medellín, Colombia",
    preferences: ["Restaurants", "Culture", "Nature"],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    isVerified: true,
    isPremium: true,
    points: 1250,
    level: 12,
    badges: ["explorer", "foodie", "social"],
    followersCount: 234,
    followingCount: 89,
    plansCreated: 15,
    plansAttended: 47,
  },
  {
    id: "2",
    name: "María González",
    username: "mariag",
    email: "maria@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c1c2?q=80&w=1000",
    bio: "Street art enthusiast | Comuna 13 guide | Sharing Medellín's transformation ✨",
    location: "Comuna 13, Medellín",
    preferences: ["Culture", "Free plans", "Nightlife"],
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    isVerified: true,
    isPremium: false,
    points: 890,
    level: 8,
    badges: ["social", "explorer"],
    followersCount: 567,
    followingCount: 123,
    plansCreated: 22,
    plansAttended: 31,
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    username: "carlosr",
    email: "carlos@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000",
    bio: "Foodie | Chef | Discovering the best flavors of Paisa cuisine 🍽️",
    location: "El Poblado, Medellín",
    preferences: ["Restaurants", "Rooftops"],
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
    isVerified: false,
    isPremium: true,
    points: 670,
    level: 6,
    badges: ["foodie"],
    followersCount: 145,
    followingCount: 67,
    plansCreated: 8,
    plansAttended: 29,
  },
];

export type SocialUser = {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
};

export const SOCIAL_MOCK_USERS: SocialUser[] = [
  { id: "social-1", name: "Valentina R.", username: "valer", avatarColor: "#FF6B6B" },
  { id: "social-2", name: "Mateo L.", username: "mateolab", avatarColor: "#4ECDC4" },
  { id: "social-3", name: "Sara Q.", username: "sarita", avatarColor: "#FFD166" },
  { id: "social-4", name: "Julián T.", username: "jtoro", avatarColor: "#A29BFE" },
  { id: "social-5", name: "Camila V.", username: "milavibes", avatarColor: "#FF8FB1" },
  { id: "social-6", name: "Nicolás P.", username: "nicoparra", avatarColor: "#6C5CE7" },
];

export type PublicProfileUser = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  createdPlans: string[];
  attendedPlans: string[];
  reputationScore: number;
};

export const PUBLIC_PROFILE_USERS: PublicProfileUser[] = [
  {
    id: "profile-1",
    name: "Valentina Ríos",
    username: "valer",
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
    createdPlans: ["rooftop-001", "cafe-001"],
    attendedPlans: ["bar-001", "club-001", "restaurante-001"],
    reputationScore: 92,
  },
  {
    id: "profile-2",
    name: "Mateo Laborde",
    username: "mateolab",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
    createdPlans: ["mirador-001", "parque-001"],
    attendedPlans: ["rooftop-001"],
    reputationScore: 78,
  },
  {
    id: "profile-3",
    name: "Sara Quintana",
    username: "sarita",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    createdPlans: [],
    attendedPlans: ["restaurante-001", "parque-001"],
    reputationScore: 84,
  },
];

export type ProfileFriendUser = {
  username: string;
  name: string;
  avatarColor: string;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
};

export const PROFILE_FRIENDS_USERS: ProfileFriendUser[] = [
  { username: "valer", name: "Valentina Ríos", avatarColor: "#FF6B6B", isFriend: true },
  { username: "mateolab", name: "Mateo Laborde", avatarColor: "#4ECDC4" },
  { username: "sarita", name: "Sara Quintana", avatarColor: "#FFD166", hasPendingRequest: true },
  { username: "jtoro", name: "Julián Toro", avatarColor: "#A29BFE" },
];