import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Home, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FallbackScreenProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  onRetry?: () => void;
}

export default function FallbackScreen({
  title = 'Contenido no encontrado',
  message = 'Lo sentimos, no pudimos encontrar lo que buscas.',
  showHomeButton = true,
  showBackButton = true,
  onRetry,
}: FallbackScreenProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color={Colors.light.darkGray} />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onRetry}
            >
              <Text style={styles.primaryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          )}
          
          {showBackButton && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleGoBack}
            >
              <ArrowLeft size={20} color={Colors.light.text} />
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          )}
          
          {showHomeButton && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleGoHome}
            >
              <Home size={20} color={Colors.light.text} />
              <Text style={styles.secondaryButtonText}>Inicio</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});