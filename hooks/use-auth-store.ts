import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types/user';
import { supabase } from '@/lib/supabase';

// Tipo extendido de User con campos adicionales que necesita Supabase
// Nota: Algunos campos tienen nombres diferentes entre el tipo User y Supabase
export interface ExtendedUser extends Omit<User, 'createdAt' | 'updatedAt' | 'followersCount' | 'followingCount' | 'plansCreated' | 'createdPlans'> {
  created_at?: string;
  updated_at?: string;
  followers_count?: number;
  following_count?: number;
  plans_created?: number;
  interests?: string[];
  promo_code?: string;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones de autenticación
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    username: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: (onboardingData: {
    bio: string;
    interests: string[];
    avatar: string;
  }) => Promise<void>;

  // Session management
  initialize: () => Promise<void>;

  // Admin - solo para desarrollo
  clearAllData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: async () => {
        set({ isLoading: true });

        try {
          console.log('🔄 Inicializando autenticación...');

          const { currentUser } = get();

          if (currentUser) {
            console.log('✅ Sesión encontrada para:', currentUser.username);
            set({ isAuthenticated: true });
          } else {
            console.log('ℹ️ No hay sesión activa');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (emailOrUsername: string, password: string) => {
        set({ isLoading: true });

        try {
          console.log('🔐 Intentando login...');
          console.log('📧 Email/Username:', emailOrUsername);

          // Llamar a la función de Supabase
          const { data, error } = await supabase.rpc('login_user', {
            p_email_or_username: emailOrUsername,
            p_password: password,
          });

          if (error) {
            console.error('❌ Error de Supabase:', error);
            throw new Error('Error al conectar con el servidor');
          }

          console.log('📦 Respuesta de Supabase:', data);

          if (data?.success && data?.user) {
            set({
              currentUser: data.user,
              isAuthenticated: true,
              isLoading: false,
            });

            console.log('✅ Login exitoso para:', data.user.username);
            return { success: true };
          } else {
            throw new Error(data?.error || 'Credenciales incorrectas');
          }
        } catch (error: any) {
          set({ isLoading: false });
          console.error('❌ Login error:', error);
          return {
            success: false,
            error: error.message || 'Error al iniciar sesión',
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });

        try {
          console.log('🚀 Registrando usuario...');
          console.log('📧 Email:', userData.email);
          console.log('👤 Username:', userData.username);

          // Llamar a la función de Supabase
          const { data, error } = await supabase.rpc('register_user', {
            p_email: userData.email,
            p_username: userData.username,
            p_password: userData.password,
            p_name: userData.name,
          });

          if (error) {
            console.error('❌ Error de Supabase:', error);
            throw new Error('Error al conectar con el servidor');
          }

          console.log('📦 Respuesta de Supabase:', data);

          if (data?.success && data?.user) {
            set({
              currentUser: data.user,
              isAuthenticated: true,
              isLoading: false,
            });

            console.log('✅ Registro exitoso para:', data.user.username);
            return { success: true };
          } else {
            throw new Error(data?.error || 'Error al registrar usuario');
          }
        } catch (error: any) {
          set({ isLoading: false });
          console.error('❌ Register error:', error);

          return {
            success: false,
            error: error.message || 'Error al registrarse',
          };
        }
      },

      logout: async () => {
        console.log('👋 Cerrando sesión...');

        // Limpiar estado de autenticación
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      updateProfile: async (updates) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          console.log('📝 Actualizando perfil en Supabase...');

          // Actualizar en Supabase
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id);

          if (error) {
            console.error('❌ Error actualizando perfil:', error);
            throw new Error('Error al actualizar perfil');
          }

          // Actualizar estado local
          const updatedUser = { ...currentUser, ...updates };

          set({
            currentUser: updatedUser,
          });

          console.log('✅ Perfil actualizado exitosamente');
        } catch (error: any) {
          console.error('Error updating profile:', error);
          throw new Error(error.message || 'Error al actualizar perfil');
        }
      },

      completeOnboarding: async (onboardingData) => {
        const { currentUser } = get();
        if (!currentUser) {
          console.error('❌ No current user found for onboarding completion');
          throw new Error('No hay usuario autenticado');
        }

        try {
          console.log('💾 Guardando datos de onboarding...');
          console.log('👤 User ID:', currentUser.id);
          console.log('📝 Bio:', onboardingData.bio);
          console.log('🎯 Interests:', onboardingData.interests);

          const updates = {
            bio: onboardingData.bio,
            preferences: onboardingData.interests,
            avatar: onboardingData.avatar || currentUser.avatar,
          };

          // Actualizar en Supabase
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id);

          if (error) {
            console.error('❌ Error en onboarding:', error);
            throw new Error('Error al completar onboarding');
          }

          // Actualizar estado local
          const updatedUser = { ...currentUser, ...updates };

          set({
            currentUser: updatedUser,
          });

          console.log('✅ Onboarding completado exitosamente');
        } catch (error) {
          console.error('❌ Error completing onboarding:', error);
          throw error;
        }
      },

      clearAllData: async () => {
        console.log('🗑️ Limpiando todos los datos de autenticación...');

        // Limpiar AsyncStorage
        await AsyncStorage.removeItem('auth-storage');

        // Resetear estado
        set({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
        });

        console.log('✅ Datos limpiados. Recarga la app para empezar de cero.');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
