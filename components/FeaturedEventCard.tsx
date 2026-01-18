import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Event } from '@/types/plan';
import theme from '@/lib/theme';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface FeaturedEventCardProps {
  event: Event;
}

export default function FeaturedEventCard({ event }: FeaturedEventCardProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/event/${event.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Gratis';
    return `$${price.toLocaleString('es-CO')}`;
  };

  return (
    <Animated.View entering={FadeInDown.delay(400).duration(600)}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handlePress}
        style={styles.container}
      >
        <ImageBackground
          source={{ uri: event.image }}
          style={styles.imageBackground}
          imageStyle={styles.image}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
            style={styles.gradient}
          >
            {/* Badge de evento destacado */}
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>⭐ EVENTO PRINCIPAL</Text>
              </LinearGradient>
            </View>

            {/* Contenido */}
            <View style={styles.content}>
              <Text style={styles.category}>{event.category}</Text>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {event.description}
              </Text>

              {/* Info grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Calendar size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.infoText}>{formatDate(event.startDate)}</Text>
                </View>

                <View style={styles.infoItem}>
                  <MapPin size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {event.location.address?.split(',')[0] || 'Por definir'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Users size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    {event.currentAttendees}/{event.maxAttendees || '∞'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ticket size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.infoText}>{formatPrice(event.price)}</Text>
                </View>
              </View>

              {/* CTA Button */}
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaButtonText}>Ver detalles del evento</Text>
                <Text style={styles.ctaButtonSubtext}>
                  🎉 10% de descuento con tu código
                </Text>
              </LinearGradient>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  imageBackground: {
    width: '100%',
    minHeight: 420,
  },
  image: {
    borderRadius: 24,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    gap: 8,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: '48%',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  ctaButtonSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
  },
});
