import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Search, Bell, Star, Crown } from "lucide-react-native";
import Animated, { 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  useAnimatedScrollHandler,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

import SearchBar from "@/components/SearchBar";
import FABSpeedDial from "@/components/FABSpeedDial";
import UserGreeting from "@/components/UserGreeting";
import SpotlightCard from "@/components/SpotlightCard";
import TrendingCard from "@/components/TrendingCard";
import PatchGridItem from "@/components/PatchGridItem";
import theme from "@/lib/theme";
import { mockPlans } from "@/mocks/plans";
import { Plan } from "@/types/plan";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { searchQuery, performSearch } = useSearchStore();

  // Animaciones de entrada
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);

  // Parallax global
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Spotlight: Top 5 del día (isSpotlight === true)
  const spotlightPlans = useMemo(() => {
    return mockPlans
      .filter(p => p.isSpotlight === true)
      .slice(0, 5);
  }, []);

  // Trending: Ordenados por rating, visits, saves
  const trendingPlans = useMemo(() => {
    return mockPlans
      .filter(p => !p.isSpotlight)
      .sort((a, b) => {
        const scoreA = (a.rating * 2) + (a.visits || 0) + (a.saves || 0);
        const scoreB = (b.rating * 2) + (b.visits || 0) + (b.saves || 0);
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, []);

  // All Plans Grid: Todos los planes sin spotlight
  const allPlans = useMemo(() => {
    return mockPlans.filter(p => !p.isSpotlight);
  }, []);

  const handlePlanPress = (plan: Plan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/plan/${plan.id}`);
  };

  // Estilos animados
  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    headerTranslateY.value = withDelay(0, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
    
    searchOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    searchTranslateY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { translateY: headerTranslateY.value + interpolate(scrollY.value, [0, 120], [0, -40], 'clamp') },
    ],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
    transform: [{ translateY: searchTranslateY.value }],
  }));

  // Render Spotlight Section
  const renderSpotlightSection = () => (
    <Animated.View entering={FadeInUp.delay(300)}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 Top 5 del día</Text>
      </View>
      <FlatList
        data={spotlightPlans}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={{ width: width - 40, marginRight: 20 }}>
            <SpotlightCard 
              plan={item} 
              onPress={() => handlePlanPress(item)} 
              index={index}
            />
          </View>
        )}
        keyExtractor={(item) => `spotlight-${item.id}`}
        contentContainerStyle={styles.spotlightContent}
        removeClippedSubviews={false}
        initialNumToRender={5}
        windowSize={7}
      />
    </Animated.View>
  );

  // Render Trending Section
  const renderTrendingSection = () => (
    <Animated.View entering={FadeInUp.delay(500)}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⭐ Tendencias</Text>
      </View>
      <FlatList
        data={trendingPlans}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={{ width: 260, marginRight: 16 }}>
            <TrendingCard 
              plan={item} 
              onPress={() => handlePlanPress(item)} 
              index={index}
            />
          </View>
        )}
        keyExtractor={(item) => `trending-${item.id}`}
        contentContainerStyle={styles.trendingContent}
        removeClippedSubviews={false}
        initialNumToRender={5}
        windowSize={7}
      />
    </Animated.View>
  );

  // Render All Plans Grid
  const renderAllPlansGrid = () => (
    <Animated.View entering={FadeInUp.delay(700)}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🌍 Todos los parches</Text>
      </View>
      <FlatList
        data={allPlans}
        numColumns={3}
        keyExtractor={(item) => `grid-${item.id}`}
        renderItem={({ item, index }) => (
          <PatchGridItem 
            plan={item} 
            onPress={() => handlePlanPress(item)} 
            index={index}
          />
        )}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        scrollEnabled={false}
        removeClippedSubviews={false}
        initialNumToRender={12}
        windowSize={7}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerIcon}>
                <Search size={18} color="#1A1A1A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <Bell size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.greetingSection}>
            <UserGreeting />
          </View>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Star size={16} color={theme.colors.primary} />
              <Text style={styles.statText}>{user?.points || 0}</Text>
            </View>
            {user?.isPremium && (
              <Crown size={20} color={theme.colors.primary} />
            )}
          </View>
        </Animated.View>

        {/* Search */}
        <Animated.View style={[styles.searchContainer, searchStyle]}>
          <SearchBar
            value={searchQuery}
            onChangeText={performSearch}
            placeholder="Buscar planes, lugares, eventos..."
            showSuggestions={true}
            showFilter={true}
            onFilterPress={() => {}}
          />
        </Animated.View>

        {/* Spotlight Section */}
        {spotlightPlans.length > 0 && renderSpotlightSection()}

        {/* Trending Section */}
        {trendingPlans.length > 0 && renderTrendingSection()}

        {/* All Plans Grid */}
        {allPlans.length > 0 && renderAllPlansGrid()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <FABSpeedDial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E0E',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
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
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
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
    color: theme.colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotlightContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  trendingContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
