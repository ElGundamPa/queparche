import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw, Search, MapPin, Calendar } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface EmptyStateProps {
  type: 'plans' | 'shorts' | 'events' | 'search' | 'category';
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  onAction?: () => void;
  actionText?: string;
  category?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  subtitle,
  onRetry,
  onAction,
  actionText,
  category,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'plans':
        return <MapPin size={48} color={Colors.light.darkGray} />;
      case 'shorts':
        return <Calendar size={48} color={Colors.light.darkGray} />;
      case 'events':
        return <Calendar size={48} color={Colors.light.darkGray} />;
      case 'search':
        return <Search size={48} color={Colors.light.darkGray} />;
      case 'category':
        return <MapPin size={48} color={Colors.light.darkGray} />;
      default:
        return <MapPin size={48} color={Colors.light.darkGray} />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'plans':
        return {
          title: 'No hay parches disponibles',
          subtitle: '¡Sé el primero en crear un parche increíble para la comunidad!',
          actionText: 'Crear parche',
        };
      case 'shorts':
        return {
          title: 'No hay shorts disponibles',
          subtitle: '¡Comparte un video corto de tu lugar favorito en Medellín!',
          actionText: 'Subir short',
        };
      case 'events':
        return {
          title: 'No hay eventos hoy',
          subtitle: 'Revisa mañana o crea tu propio evento.',
          actionText: 'Crear evento',
        };
      case 'search':
        return {
          title: 'No encontramos resultados',
          subtitle: 'Intenta con otras palabras clave o explora las categorías.',
          actionText: 'Limpiar búsqueda',
        };
      case 'category':
        return {
          title: `No hay planes de ${category}`,
          subtitle: 'Prueba con otra categoría o crea el primer plan de este tipo.',
          actionText: 'Ver todas las categorías',
        };
      default:
        return {
          title: 'No hay contenido',
          subtitle: 'Vuelve más tarde o intenta refrescar.',
          actionText: 'Reintentar',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displaySubtitle = subtitle || defaultContent.subtitle;
  const displayActionText = actionText || defaultContent.actionText;

  return (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.container}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.subtitle}>{displaySubtitle}</Text>
      
      <View style={styles.buttonContainer}>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <RefreshCw size={16} color={Colors.light.primary} />
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        )}
        
        {onAction && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <Text style={styles.actionText}>{displayActionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.background,
  },
});

export default EmptyState;