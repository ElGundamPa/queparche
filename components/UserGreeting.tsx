import React from 'react';
import { View, Text, Image } from 'react-native';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useUserStore } from '@/hooks/use-user-store';
import { resolveUserName } from '@/lib/userName';
import theme from '@/lib/theme';

export const UserGreeting = () => {
  // Try auth store first (used in Profile), then user store (used in Home)
  const authUser = useAuthStore((s) => s.currentUser);
  const userStoreUser = useUserStore((s) => s.user);
  
  // Use whichever user is available
  const currentUser = authUser || userStoreUser;
  
  const name = resolveUserName({
    name: currentUser?.name,
    username: currentUser?.username,
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {currentUser?.avatar ? (
        <Image
          source={{ uri: currentUser.avatar }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
      ) : (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
          }}
        />
      )}
      <View>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
          {`¿Qué Parche ${name} 👋?`}
        </Text>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: 18,
            fontWeight: '600',
          }}
        >
          Encuentra planes en segundos.
        </Text>
      </View>
    </View>
  );
};

export default UserGreeting;

