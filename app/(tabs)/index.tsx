import React, { useMemo, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Star, Crown } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  useAnimatedScrollHandler,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { Stack, useRouter } from "expo-router";

import SearchBar from "@/components/SearchBar";
import FABSpeedDial from "@/components/FABSpeedDial";
import UserGreeting from "@/components/UserGreeting";
import TopPlansCarousel from "@/components/TopPlansCarousel";
import TrendingPlansCarousel from "@/components/TrendingPlansCarousel";
import ZoneSelector from "@/components/ZoneSelector";
import PatchGridItem from "@/components/PatchGridItem";
import theme from "@/lib/theme";
import { Plan } from "@/types/plan";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";
import HomeHeaderActions from "@/components/HomeHeaderActions";
import { usePlansStore } from "@/store/plansStore";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { searchQuery, performSearch } = useSearchStore();
  const plans = usePlansStore((state) => state.plans);
  const [selectedZone, setSelectedZone] = useState<string>("medellin");

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
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { translateY: headerTranslateY.value + interpolate(scrollY.value, [0, 120], [0, -40], "clamp") },
    ],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    opacity: searchOpacity.value,
    transform: [{ translateY: searchTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerRight: () => <HomeHeaderActions />,
          headerStyle: { backgroundColor: "transparent" },
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

        {/* ZoneSelector arriba */}
        <View style={styles.zoneSelectorContainer}>
          <ZoneSelector
            selectedZone={selectedZone}
            onZoneSelect={setSelectedZone}
            navigateOnPress={false}
          />
        </View>

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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  bottomSpacing: {
    height: 60,
  },
});
