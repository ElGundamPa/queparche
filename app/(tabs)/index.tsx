import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ListRenderItem,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Calendar, Star, Crown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";


import PlanCard from "@/components/PlanCard";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import FABSpeedDial from "@/components/FABSpeedDial";
import HorizontalCategories from "@/components/HorizontalCategories";
import ZoneSection from "@/components/ZoneSection";
import EmptyState from "@/components/EmptyState";
import { PlanCardSkeleton } from "@/components/SkeletonLoader";
import Colors from "@/constants/colors";
import { categories } from "@/mocks/categories";
import { useFilteredPlans, usePlansStore, useTopPlans } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";
import HorizontalCards from "@/components/HorizontalCards";



type SectionType = 
  | { type: 'header' }
  | { type: 'search' }
  | { type: 'events'; data: any[] }
  | { type: 'featured'; data: any[] }
  | { type: 'topPlans'; data: any[] }
  | { type: 'filteredPlans'; data: any[] }
  | { type: 'categories' }
  | { type: 'zones' }
  | { type: 'spacing' };

export default function HomeScreen() {
  const { selectedCategory, setSelectedCategory, events, isLoading } = usePlansStore();
  const { user } = useUserStore();
  const { searchQuery, performSearch, filteredPlans: searchFilteredPlans } = useSearchStore();
  const topPlans = useTopPlans();
  const defaultFilteredPlans = useFilteredPlans();
  const filteredPlans = searchQuery ? searchFilteredPlans : defaultFilteredPlans;

  const handleCategoryPress = (categoryName: string) => {
    Haptics.selectionAsync();
    const newCategory = selectedCategory === categoryName ? null : categoryName;
    setSelectedCategory(newCategory);
  };



  const todayEvents = events.filter(event => {
    const today = new Date().toDateString();
    const eventDate = new Date(event.startDate).toDateString();
    return today === eventDate;
  });

  const sections = useMemo((): SectionType[] => {
    const sectionList: SectionType[] = [
      { type: 'header' },
      { type: 'search' },
    ];

    if (todayEvents.length > 0) {
      sectionList.push({ type: 'events', data: todayEvents.slice(0, 3) });
    }

    if (topPlans.length > 0) {
      sectionList.push({ type: 'featured', data: topPlans });
      if (topPlans.length > 2) {
        sectionList.push({ type: 'topPlans', data: topPlans.slice(2) });
      }
    }

    if (filteredPlans.length > 0) {
      sectionList.push({ type: 'filteredPlans', data: filteredPlans.slice(0, 12) });
    }

    sectionList.push({ type: 'categories' });

    sectionList.push({ type: 'zones' });
    sectionList.push({ type: 'spacing' });
    return sectionList;
  }, [todayEvents, topPlans, filteredPlans]);

  const renderSection: ListRenderItem<SectionType> = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <Animated.View entering={FadeInDown.delay(100)}>
            <LinearGradient
              colors={['rgba(0, 212, 170, 0.1)', 'transparent']}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.greeting}>Hola {user?.name?.split(' ')[0] || 'Parcero'} 👋</Text>
                  <Text style={styles.title}>¿Qué parche hay hoy en Medellín? 🔥</Text>
                  <Text style={styles.subtitle}>Encuentra planes en segundos.</Text>
                </View>
                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <Star size={16} color={Colors.light.premium} />
                    <Text style={styles.statText}>{user?.points || 0}</Text>
                  </View>
                  {user?.isPremium && (
                    <Crown size={20} color={Colors.light.premium} />
                  )}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        );

      case 'search':
        return (
          <Animated.View entering={FadeInDown.delay(200)}>
            <SearchBar
              value={searchQuery}
              onChangeText={performSearch}
              placeholder="Buscar planes, lugares, eventos..."
              showSuggestions={true}
              showFilter={true}
              onFilterPress={() => {}}
            />
          </Animated.View>
        );

      case 'events':
        return (
          <Animated.View entering={FadeInUp.delay(300)}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Eventos de hoy</Text>
            </View>
            <HorizontalCards
              data={item.data}
              keyExtractor={(ev) => ev.id}
              itemWidth={280}
              renderItem={({ item: event, index }) => (
                <Animated.View entering={FadeInUp.delay(400 + index * 100)}>
                  <EventCard event={event} />
                </Animated.View>
              )}
              gap={16}
              contentPaddingHorizontal={20}
              testID="events-horizontal"
            />
          </Animated.View>
        );

      case 'featured':
        return (
          <Animated.View entering={FadeInUp.delay(400)}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={Colors.light.premium} />
              <Text style={styles.sectionTitle}>Plan destacado</Text>
            </View>
            <HorizontalCards
              data={item.data}
              keyExtractor={(plan) => plan.id}
              itemWidth={280}
              renderItem={({ item: plan, index }) => (
                <Animated.View entering={FadeInUp.delay(500 + index * 100)}>
                  <PlanCard plan={plan} horizontal={false} />
                </Animated.View>
              )}
              gap={16}
              contentPaddingHorizontal={20}
              testID="featured-horizontal"
            />
          </Animated.View>
        );

      case 'topPlans':
        return (
          <Animated.View entering={FadeInUp.delay(500)}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={Colors.light.premium} />
              <Text style={styles.sectionTitle}>Más planes populares</Text>
            </View>
            {isLoading ? (
              <HorizontalCards
                data={[1, 2, 3]}
                renderItem={() => <PlanCardSkeleton horizontal={true} />}
                keyExtractor={(item) => item.toString()}
                itemWidth={280}
                gap={16}
                contentPaddingHorizontal={20}
                testID="topplans-skeleton"
              />
            ) : item.data.length > 0 ? (
              <HorizontalCards
                data={item.data}
                renderItem={({ item: plan, index }) => (
                  <Animated.View entering={FadeInUp.delay(600 + index * 100)}>
                    <PlanCard plan={plan} horizontal={true} />
                  </Animated.View>
                )}
                keyExtractor={(plan) => plan.id}
                itemWidth={280}
                gap={16}
                contentPaddingHorizontal={20}
                testID="topplans-horizontal"
              />
            ) : (
              <EmptyState
                type="plans"
                title="No hay planes populares"
                subtitle="¡Sé el primero en crear un parche que se vuelva popular!"
                onAction={() => {
                }}
                actionText="Crear parche"
              />
            )}
          </Animated.View>
        );

      case 'categories':
        return (
          <Animated.View entering={FadeInUp.delay(600)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explorar por categoría</Text>
            </View>
            <HorizontalCategories
              data={categories}
              selectedCategory={selectedCategory}
              onCategoryPress={handleCategoryPress}
            />
          </Animated.View>
        );

      case 'zones':
        return (
          <Animated.View entering={FadeInUp.delay(700)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Parches por zona</Text>
            </View>
            <ZoneSection />
          </Animated.View>
        );

      case 'filteredPlans':
        return (
          <Animated.View entering={FadeInUp.delay(800)} style={styles.filteredPlansSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery
                  ? "Resultados"
                  : selectedCategory
                  ? `Planes de ${selectedCategory}`
                  : "Todos los planes"}
              </Text>
            </View>
            {isLoading ? (
              <HorizontalCards
                data={[1, 2, 3, 4]}
                renderItem={() => <PlanCardSkeleton horizontal={true} />}
                keyExtractor={(item) => item.toString()}
                itemWidth={280}
                gap={16}
                contentPaddingHorizontal={20}
                testID="filtered-skeleton"
              />
            ) : item.data.length > 0 ? (
              <HorizontalCards
                data={item.data}
                renderItem={({ item: plan, index }) => (
                  <Animated.View entering={FadeInUp.delay(900 + index * 100)}>
                    <PlanCard plan={plan} horizontal={true} />
                  </Animated.View>
                )}
                keyExtractor={(plan) => plan.id}
                itemWidth={280}
                gap={16}
                contentPaddingHorizontal={20}
                testID="filtered-horizontal"
              />
            ) : (
              <EmptyState
                type={searchQuery ? 'search' : selectedCategory ? 'category' : 'plans'}
                category={selectedCategory || undefined}
                onRetry={() => {
                  if (searchQuery) {
                    performSearch('');
                  } else if (selectedCategory) {
                    setSelectedCategory(null);
                  }
                }}
                onAction={() => {
                }}
              />
            )}
          </Animated.View>
        );

      case 'spacing':
        return <View style={styles.bottomSpacing} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={sections}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />

      {/* Floating Action Button */}
      <FABSpeedDial />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  contentContainer: {
    paddingBottom: 100,
  },
  
  // Header Section - Improved spacing and responsiveness
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 80, // Prevent content jumping
  },
  greeting: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginBottom: 6,
    lineHeight: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 6,
    lineHeight: 34,
    flexShrink: 1, // Allow text to wrap if needed
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 18,
    flexShrink: 1,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0, // Prevent stats from shrinking
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  
  // Section Headers - Consistent spacing
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32, // Increased spacing between sections
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    lineHeight: 22,
  },
  
  // Events Section - Horizontal scroll
  eventCard: {
    width: 260,
    minWidth: 260,
  },
  
  // Top Plans Section - Improved horizontal scrolling
  topPlansContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
  },
  
  // Categories section - now horizontal
  categoriesSection: {
    marginBottom: 16,
  },
  
  // Filtered Plans Section - Horizontal scroll layout
  filteredPlansSection: {
    marginBottom: 32, // Increased bottom spacing
  },
  horizontalScrollContainer: {
    flexGrow: 0, // Prevent container from growing
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra padding for last item
  },
  horizontalPlanCard: {
    width: 280, // Fixed width for consistent card sizing
    minWidth: 280, // Ensure minimum width
  },
  
  // Horizontal Lists - Consistent padding
  horizontalListContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra padding for last item
  },
  
  // Featured Section - Horizontal scroll
  featuredSection: {
    marginBottom: 32,
  },
  
  // Bottom spacing for FAB
  bottomSpacing: {
    height: 20,
  },
});