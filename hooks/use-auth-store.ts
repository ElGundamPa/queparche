import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from '@/mocks/users';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  bio: string;
  avatar: string;
  interests: string[];
  location: string;
  isVerified: boolean;
  isPremium: boolean;
  points: number;
  followersCount: number;
  followingCount: number;
  plansAttended: number;
  badges: string[];
  preferences: string[];
  createdAt: string;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: Array<User & { password?: string }>; // Lista de todos los usuarios registrados
  
  // Acciones de autenticación
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'points' | 'followersCount' | 'followingCount' | 'plansAttended' | 'badges' | 'preferences' | 'isVerified' | 'isPremium'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  completeOnboarding: (onboardingData: { bio: string; interests: string[]; avatar: string }) => void;
}

// Usuario por defecto para pruebas
const initialUsers = mockUsers.map(user => ({
  ...user,
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      users: initialUsers,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { users } = get();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const { password: _password, ...safeUser } = user;
          set({ 
            currentUser: safeUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        }

        // Fallback: buscar en mockUsers (por si el storage persistido está desactualizado)
        const seedUser = mockUsers.find(u => u.email === email && u.password === password);
        if (seedUser) {
          const updatedUsers = [...users, seedUser];
          const { password: _password, ...safeUser } = seedUser;
          set({
            users: updatedUsers,
            currentUser: safeUser,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { users } = get();
        
        // Verificar si el email o username ya existen
        const emailExists = users.some(u => u.email === userData.email);
        const usernameExists = users.some(u => u.username === userData.username);
        
        if (emailExists) {
          set({ isLoading: false });
          throw new Error('El email ya está registrado');
        }
        
        if (usernameExists) {
          set({ isLoading: false });
          throw new Error('El nombre de usuario ya está en uso');
        }
        
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          points: 0,
          followersCount: 0,
          followingCount: 0,
          plansAttended: 0,
          badges: [],
          preferences: [],
          isVerified: false,
          isPremium: false,
          bio: '',
          interests: [],
          avatar: '',
          location: '',
          createdAt: new Date().toISOString(),
        };
        
        console.log('=== REGISTER DEBUG ===');
        console.log('New user created:', newUser);
        console.log('Setting current user and authentication...');
        
        set({ 
          users: [...users, newUser],
          currentUser: { ...newUser, password: undefined },
          isAuthenticated: true,
          isLoading: false 
        });
        
        console.log('User registered successfully');
        console.log('========================');
        
        return true;
      },

      logout: () => {
        set({ 
          currentUser: null, 
          isAuthenticated: false 
        });
      },

      updateProfile: (updates) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, ...updates };
        const updatedUsers = users.map(u => 
          u.id === currentUser.id ? { ...updatedUser, password: u.password } : u
        );
        
        set({ 
          currentUser: updatedUser,
          users: updatedUsers 
        });
      },

      completeOnboarding: (onboardingData) => {
        const { currentUser, users } = get();
        if (!currentUser) {
          console.log('No current user found for onboarding completion');
          return;
        }
        
        console.log('=== COMPLETE ONBOARDING ===');
        console.log('Current user before update:', currentUser);
        console.log('Onboarding data:', onboardingData);
        
        const updatedUser = {
          ...currentUser,
          bio: onboardingData.bio,
          interests: onboardingData.interests,
          avatar: onboardingData.avatar,
          preferences: onboardingData.interests, // Mapear intereses a preferencias
        };
        
        console.log('Updated user:', updatedUser);
        
        const updatedUsers = users.map(u => 
          u.id === currentUser.id ? { ...updatedUser, password: u.password } : u
        );
        
        set({ 
          currentUser: updatedUser,
          users: updatedUsers 
        });
        
        console.log('Onboarding data saved successfully');
        console.log('===============================');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        users: state.users 
      }),
    }
  )
);
