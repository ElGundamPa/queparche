import React, { useMemo, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Search, Bell, Star, Crown } from "lucide-react-native";
import Animated, {
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
import TopPlansCarousel from "@/components/TopPlansCarousel";
import TrendingStrip from "@/components/TrendingStrip";
import PatchGridItem from "@/components/PatchGridItem";
import theme from "@/lib/theme";
import { mockPlans } from "@/mocks/plans";
import { Plan } from "@/types/plan";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { searchQuery, performSearch } = useSearchStore();

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const allPlans = useMemo(() => mockPlans, []);

  const handlePlanPress = (plan: Plan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/plan/${plan.id}`);
  };

  useEffect(() => {
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

        <Text style={styles.sectionLabel}>🔥 Top 5 del día</Text>
        <TopPlansCarousel />

        <Text style={styles.sectionLabel}>⭐ Tendencias en Medellín</Text>
        <TrendingStrip />

        <Text style={styles.sectionLabel}>🌍 Todos los parches</Text>
        <View>
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
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 16,
    marginTop: 28,
    marginBottom: 16,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 12,
  },
  bottomSpacing: {
    height: 60,
  },
});
