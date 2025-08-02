import { useRouter } from "expo-router";
import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Star, Crown, MapPin, Users, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { Plan } from "@/types/plan";

interface PlanCardProps {
  plan: Plan;
  horizontal?: boolean;
}

const { width } = Dimensions.get("window");

const PlanCard = memo(function PlanCard({ plan, horizontal = true }: PlanCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/plan/${plan.id}`);
  };

  if (horizontal) {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={handlePress}
        testID={`plan-card-${plan.id}`}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: plan.images[0] }}
            style={styles.horizontalImage}
            contentFit="cover"
            transition={200}
          />
          {plan.isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={12} color={Colors.light.premium} />
            </View>
          )}
          {plan.isSponsored && (
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>Patrocinado</Text>
            </View>
          )}
          <View style={styles.ratingBadge}>
            <Star size={10} color={Colors.light.premium} fill={Colors.light.premium} />
            <Text style={styles.ratingText}>{plan.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.name} numberOfLines={1}>
            {plan.name}
          </Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{plan.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Users size={12} color={Colors.light.darkGray} />
              <Text style={styles.infoText}>
                {plan.currentPeople}/{plan.maxPeople}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Heart size={12} color={Colors.light.darkGray} />
              <Text style={styles.infoText}>{plan.likes}</Text>
            </View>
          </View>
          {plan.price && plan.price > 0 && (
            <Text style={styles.price}>
              ${plan.price.toLocaleString()} COP
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={handlePress}
      testID={`plan-card-${plan.id}`}
    >
      <View style={styles.verticalImageContainer}>
        <Image
          source={{ uri: plan.images[0] }}
          style={styles.verticalImage}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        {plan.isPremium && (
          <View style={[styles.premiumBadge, styles.verticalPremiumBadge]}>
            <Crown size={14} color={Colors.light.premium} />
          </View>
        )}
        {plan.isSponsored && (
          <View style={[styles.sponsoredBadge, styles.verticalSponsoredBadge]}>
            <Text style={styles.sponsoredText}>Patrocinado</Text>
          </View>
        )}
      </View>
      <View style={styles.verticalContent}>
        <View style={styles.verticalHeader}>
          <Text style={styles.verticalName} numberOfLines={1}>
            {plan.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={12} color={Colors.light.premium} fill={Colors.light.premium} />
            <Text style={styles.verticalRating}>{plan.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{plan.category}</Text>
        </View>
        <View style={styles.verticalInfoRow}>
          <View style={styles.infoItem}>
            <MapPin size={12} color={Colors.light.darkGray} />
            <Text style={styles.verticalInfoText} numberOfLines={1}>
              {plan.location.address?.split(',')[0] || 'Medellín'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Users size={12} color={Colors.light.darkGray} />
            <Text style={styles.verticalInfoText}>
              {plan.currentPeople}/{plan.maxPeople}
            </Text>
          </View>
        </View>
        {plan.price && plan.price > 0 && (
          <Text style={styles.verticalPrice}>
            ${plan.price.toLocaleString()} COP
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default PlanCard;

const styles = StyleSheet.create({
  horizontalCard: {
    width: width * 0.75,
    height: 140,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    marginRight: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  horizontalImage: {
    width: 140,
    height: "100%",
  },
  horizontalContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  verticalCard: {
    width: "100%",
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  verticalImageContainer: {
    height: 200,
    position: 'relative',
  },
  verticalImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  verticalContent: {
    padding: 16,
  },
  verticalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  verticalName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginVertical: 6,
  },
  category: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.black,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  verticalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    fontWeight: '500',
  },
  verticalInfoText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    fontWeight: '500',
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: 4,
  },
  verticalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: 8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.black,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.light.premium,
  },
  verticalPremiumBadge: {
    top: 12,
    right: 12,
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.light.info,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verticalSponsoredBadge: {
    top: 12,
    left: 12,
  },
  sponsoredText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.white,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.light.black,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verticalRating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
});