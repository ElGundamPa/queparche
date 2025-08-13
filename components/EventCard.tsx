import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Calendar, MapPin, Users, Clock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { Event } from "@/types/plan";

interface EventCardProps {
  event: Event;
}

const { width } = Dimensions.get("window");

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      testID={`event-card-${event.id}`}
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
          <Text style={styles.timeText}>{formatTime(event.startDate)}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{event.category}</Text>
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
          {(typeof event.price === 'number' && event.price > 0) && (
            <Text style={styles.price}>
              ${event.price.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});