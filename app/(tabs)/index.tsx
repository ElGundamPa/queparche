import React, { useMemo, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Star, Zap, Sparkles, Heart } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  useAnimatedScrollHandler,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

import SearchBar from "@/components/SearchBar";
import FABSpeedDial from "@/components/FABSpeedDial";
import UserGreeting from "@/components/UserGreeting";
import TopPlansCarousel from "@/components/TopPlansCarousel";
import TrendingPlansCarousel from "@/components/TrendingPlansCarousel";
import ZoneSelector from "@/components/ZoneSelector";
import PatchGridItem from "@/components/PatchGridItem";
import PromoCard from "@/components/PromoCard";
import FeaturedEventCard from "@/components/FeaturedEventCard";
import theme from "@/lib/theme";
import { Plan } from "@/types/plan";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";
import { useAuthStore } from "@/hooks/use-auth-store";
import HomeHeaderActions from "@/components/HomeHeaderActions";
import { usePlansStore } from "@/store/plansStore";
import { mockEvents } from "@/mocks/events";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { searchQuery, performSearch } = useSearchStore();
  const plans = usePlansStore((state) => state.plans);
  const [selectedZone, setSelectedZone] = useState<string>("medellin");

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);
  const recommendedOpacity = useSharedValue(0);
  const recommendedTranslateY = useSharedValue(30);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Mapeo de intereses a categorías de planes
  const interestToCategoryMap: Record<string, string[]> = {
    'restaurants': ['gastronomia', 'restaurantes', 'comida'],
    'rooftops': ['bares', 'rooftop', 'terrazas'],
    'free-plans': ['gratis', 'gratuito', 'free'],
    'culture': ['cultura', 'museos', 'arte', 'teatro'],
    'nature': ['naturaleza', 'parques', 'aire libre', 'senderismo'],
    'nightlife': ['fiesta', 'discoteca', 'bar', 'vida nocturna'],
    'sports': ['deportes', 'fitness', 'gimnasio', 'ejercicio'],
    'shopping': ['compras', 'shopping', 'tiendas', 'centros comerciales'],
    'music': ['musica', 'conciertos', 'festivales', 'shows'],
    'travel': ['viajes', 'tours', 'turismo', 'excursiones'],
  };

  // Planes recomendados basados en intereses del usuario
  const recommendedPlans = useMemo(() => {
    if (!currentUser?.interests || currentUser.interests.length === 0) {
      return [];
    }

    const userInterests = currentUser.interests;
    const recommendedCategories: string[] = [];

    // Mapear intereses del usuario a categorías
    userInterests.forEach(interest => {
      const categories = interestToCategoryMap[interest];
      if (categories) {
        recommendedCategories.push(...categories);
      }
    });

    // Filtrar planes que coincidan con las categorías
    const filtered = plans.filter(plan => {
      const planCategory = plan.category?.toLowerCase() || '';
      const planTags = plan.tags?.map(t => t.toLowerCase()) || [];

      return recommendedCategories.some(cat =>
        planCategory.includes(cat) ||
        planTags.some(tag => tag.includes(cat))
      );
    });

    // Limitar a 6 planes recomendados
    return filtered.slice(0, 6);
  }, [currentUser?.interests, plans]);

  // Filtrar planes por zona y tag
  const allPlans = useMemo(() => {
    let filtered = plans;

    // Filtrar por zona
    if (selectedZone && selectedZone !== "medellin") {
      const normalizeZoneName = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[áàäâ]/g, "a")
          .replace(/[éèëê]/g, "e")
          .replace(/[íìïî]/g, "i")
          .replace(/[óòöô]/g, "o")
          .replace(/[úùüû]/g, "u")
          .replace(/[ñ]/g, "n")
          .replace(/[ç]/g, "c")
          .replace(/[-–]/g, " ")
          .trim();
      };

      const normalizedSelected = normalizeZoneName(selectedZone);
      filtered = filtered.filter((plan) => {
        const planZone = plan.location.zone || plan.location.city || "";
        const normalizedPlanZone = normalizeZoneName(planZone);

        // Buscar coincidencia parcial o completa
        return (
          normalizedPlanZone.includes(normalizedSelected) ||
          normalizedSelected.includes(normalizedPlanZone) ||
          normalizedPlanZone.split(" ").some((word) => normalizedSelected.includes(word)) ||
          normalizedSelected.split(" ").some((word) => normalizedPlanZone.includes(word))
        );
      });
    }

    return filtered;
  }, [selectedZone, plans]);

  const handlePlanPress = (plan: Plan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/plan/${plan.id}`);
  };

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    headerTranslateY.value = withDelay(0, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));

    searchOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    searchTranslateY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));

    // Animate recommended section if user has interests
    if (recommendedPlans.length > 0) {
      recommendedOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
      recommendedTranslateY.value = withDelay(400, withTiming(0, { duration: 500 }));
    }
  }, [recommendedPlans.length]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { translateY: headerTranslateY.value },
    ],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
    transform: [{ translateY: searchTranslateY.value }],
  }));

  const recommendedStyle = useAnimatedStyle(() => ({
    opacity: recommendedOpacity.value,
    transform: [{ translateY: recommendedTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerLeft: () => null,
          headerRight: () => <HomeHeaderActions />,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerShadowVisible: false,
        }}
      />
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.greetingSection}>
            <UserGreeting />
          </View>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Star size={16} color={theme.colors.primary} fill={theme.colors.primary} />
              <Text style={styles.statText}>{user?.points || 0}</Text>
            </View>
            {user?.isPremium && (
              <View style={styles.premiumBadge}>
                <Zap size={18} color={theme.colors.primary} fill={theme.colors.primary} />
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[styles.searchContainer, searchStyle]}>
          <SearchBar
            value={searchQuery}
            onChangeText={performSearch}
            placeholder="Buscar planes, lugares, eventos..."
            showSuggestions={true}
            showFilter={true}
            onFilterPress={() => { }}
          />
        </Animated.View>

        {/* Barra de división */}
        <View style={styles.divider} />

        {/* ZoneSelector arriba */}
        <View style={styles.zoneSelectorContainer}>
          <ZoneSelector
            selectedZone={selectedZone}
            onZoneSelect={setSelectedZone}
            navigateOnPress={false}
          />
        </View>

        {/* Código Promocional - Siempre visible */}
        <PromoCard
          promoCode={currentUser?.promo_code || "QUEPARCHE2025"}
          userName={currentUser?.name || currentUser?.username || "Explorador"}
        />

        {/* Evento Principal: 808 Fest x Asado Mistico */}
        {mockEvents.find(e => e.isFeatured) && (
          <FeaturedEventCard event={mockEvents.find(e => e.isFeatured)!} />
        )}

        {/* Recommended Section */}
        {recommendedPlans.length > 0 && (
          <Animated.View style={recommendedStyle}>
            <View style={styles.recommendedHeader}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.recommendedBadge}
              >
                <Sparkles size={16} color="#FFF" fill="#FFF" />
                <Text style={styles.recommendedBadgeText}>Para ti</Text>
              </LinearGradient>
              <Text style={styles.recommendedTitle}>
                Recomendados según tus intereses
              </Text>
            </View>

            <View style={styles.recommendedGrid}>
              {recommendedPlans.map((plan, index) => (
                <Animated.View
                  key={`recommended-${plan.id}`}
                  entering={FadeInDown.delay(index * 100).duration(400)}
                  style={styles.recommendedItem}
                >
                  <PatchGridItem
                    plan={plan}
                    onPress={() => handlePlanPress(plan)}
                    index={index}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        <Text style={styles.sectionTitle}>🔥 Top 5 del día</Text>
        <TopPlansCarousel />

        <Text style={styles.sectionTitle}>🔥 Tendencias en Medellín</Text>
        <TrendingPlansCarousel />

        <Text style={styles.sectionTitle}>🌍 Todos los parches</Text>
        <View style={styles.gridContainer}>
          {allPlans.map((item, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            return (
              <View
                key={`grid-${item.id}`}
                style={[
                  styles.gridItem,
                  col === 0 && styles.gridItemFirst,
                  col === 2 && styles.gridItemLast,
                ]}
              >
                <PatchGridItem
                  plan={item}
                  onPress={() => handlePlanPress(item)}
                  index={index}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      <FABSpeedDial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
    paddingRight: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#121212",
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
  },
  headerEmoji: {
    fontSize: 18,
  },
  greetingSection: {
    marginBottom: 16,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F1F1F',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 16,
    marginTop: 28,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    width: '31%',
    marginBottom: 12,
  },
  gridItemFirst: {
    marginRight: 'auto',
  },
  gridItemLast: {
    marginLeft: 'auto',
  },
  zoneSelectorContainer: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  recommendedHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 20,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  recommendedBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recommendedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  recommendedItem: {
    width: '31%',
    marginBottom: 12,
  },
  bottomSpacing: {
    height: 60,
  },
});
