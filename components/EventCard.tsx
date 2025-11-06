import { useRouter } from "expo-router";
import React, { memo, useMemo, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  AccessibilityRole,
  Animated as RNAnimated,
  Easing,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { MapPin, Users, Clock, Share2, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { Event } from "@/types/plan";
import { formatCOP, formatDateTimeCO, formatDistanceKm } from "@/lib/format";
import useLocation from "@/hooks/useLocation";

interface EventCardProps {
  event: Event;
}

const { width } = Dimensions.get("window");

const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const { coords, distanceFrom } = useLocation();

  const glowOpacity = useRef<RNAnimated.Value>(new RNAnimated.Value(0.35)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        RNAnimated.timing(glowOpacity, {
          toValue: 0.25,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowOpacity]);

  const distanceMeters = useMemo(() => {
    if (!event.location || !coords) return null;
    return distanceFrom({ latitude: event.location.latitude, longitude: event.location.longitude });
  }, [coords, event.location, distanceFrom]);

  const handlePress = () => {
    // Navegar directamente al plan
    router.push(`/plan/${event.id}`);
  };

  const handleShare = () => {
    console.log("share_click", { id: event.id });
  };

  const dateLabel = formatDateTimeCO(event.startDate);
  const priceLabel = formatCOP(event.price);
  const distanceLabel = formatDistanceKm(distanceMeters ?? undefined);

  return (
    <View style={styles.cardWrapper}>
      <RNAnimated.View
        pointerEvents="none"
        style={[styles.glow, { opacity: glowOpacity }]}
        testID={`event-card-glow-${event.id}`}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View style={styles.card}>
        <Pressable
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel={`Ver detalle del evento ${event.title}`}
          onPress={handlePress}
          testID={`event-card-${event.id}`}
          style={{ flexGrow: 1 }}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.image }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />
            {event.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            )}
            <View style={styles.timeContainer}>
              <Clock size={12} color={Colors.light.white} />
              <Text style={styles.timeText} numberOfLines={1}>{dateLabel}</Text>
            </View>
          </View>
          
          <View style={styles.contentNoCta}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            
            <View style={styles.metaRow}>
              <View style={styles.categoryContainer}>
                <Text style={styles.category}>{event.category}</Text>
              </View>
              {distanceLabel ? (
                <View style={styles.distancePill} accessibilityLabel={`A ${distanceLabel}`}>
                  <MapPin size={12} color={Colors.light.background} />
                  <Text style={styles.distanceText}>{distanceLabel}</Text>
                </View>
              ) : null}
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MapPin size={12} color={Colors.light.darkGray} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {event.location.address?.split(',')[0] || 'Medellín'}
                </Text>
              </View>
            </View>
            
            <View style={styles.bottomRow}>
              <View style={styles.infoItem}>
                <Users size={12} color={Colors.light.darkGray} />
                <Text style={styles.infoText}>
                  {event.currentAttendees}/{event.maxAttendees || '∞'}
                </Text>
              </View>
              {typeof event.rating === 'number' ? (
                <View style={styles.rating}>
                  <Star size={12} color={Colors.light.premium} />
                  <Text style={styles.ratingText}>{event.rating.toFixed(1)}</Text>
                </View>
              ) : null}
              <Text style={styles.price}>{priceLabel}</Text>
            </View>
          </View>
        </Pressable>

        <View style={[styles.content, styles.ctaRow]}>
          <Pressable onPress={handlePress} style={styles.primaryCta} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Text style={styles.primaryCtaText}>Ver detalle</Text>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.secondaryCta} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Share2 size={16} color={Colors.light.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

export default EventCard;

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  glow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 4,
    height: 18,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 16,
    elevation: 0,
    zIndex: -1,
  },
  card: {
    width: width * 0.7,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    marginRight: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.premium,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.black,
  },
  timeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.white,
  },
  content: {
    padding: 16,
  },
  contentNoCta: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryContainer: {
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.white,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    color: Colors.light.background,
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    fontWeight: '500',
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.light.premium,
    fontWeight: '700',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  primaryCta: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },
  primaryCtaText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryCta: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
  },
});