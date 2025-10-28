import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import Colors from '../constants/colors';
import { useAuthStore } from '../hooks/use-auth-store';

export default function Index() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Esperar un poco para que el layout se monte completamente
    const timer = setTimeout(() => {
      setIsReady(true);
      
      console.log('=== INDEX ROUTING ===');
      console.log('Current user:', currentUser);
      console.log('Is authenticated:', isAuthenticated);
      
      if (isAuthenticated && currentUser) {
        console.log('User is authenticated, going to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('User not authenticated, going to login');
        router.replace('/(auth)/login');
      }
      console.log('====================');
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, isAuthenticated]);

  if (!isReady) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.light.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return null;
}
