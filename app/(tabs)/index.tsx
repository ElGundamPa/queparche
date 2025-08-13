import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ListRenderItem,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Calendar, Star, Crown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import CategoryButton from "@/components/CategoryButton";
import PlanCard from "@/components/PlanCard";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import ExpandableFAB from "@/components/ExpandableFAB";
import EmptyState from "@/components/EmptyState";
import { PlanCardSkeleton } from "@/components/SkeletonLoader";
import Colors from "@/constants/colors";
import { categories } from "@/mocks/categories";
import { useFilteredPlans, usePlansStore, useTopPlans } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";



type SectionType = 
  | { type: 'header' }
  | { type: 'search' }
  | { type: 'events'; data: any[] }
  | { type: 'featured'; data: any[] }
  | { type: 'topPlans'; data: any[] }
  | { type: 'categories' }
  | { type: 'filteredPlans'; data: any[] }
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
    
    // Show toast feedback
    if (newCategory) {
      Toast.show({
        type: 'success',
        text1: 'Categoría seleccionada ✅',
        text2: `Mostrando planes de ${categoryName}`,
        position: 'bottom',
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Filtro removido',
        text2: 'Mostrando todos los planes',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
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

    sectionList.push({ type: 'categories' });

    if (filteredPlans.length > 0) {
      sectionList.push({ type: 'filteredPlans', data: filteredPlans.slice(0, 6) });
    }

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
                  <Text style={styles.title}>¿Qué parche hay hoy?</Text>
                  <Text style={styles.subtitle}>Encuentra tu parche ideal en Medellín</Text>
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
              onFilterPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Filtros avanzados',
                  text2: 'Próximamente disponible',
                  position: 'bottom',
                  visibilityTime: 2000,
                });
              }}
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
            <View style={styles.eventsContainer}>
              {item.data.map((event, index) => (
                <Animated.View key={event.id} entering={FadeInUp.delay(400 + index * 100)}>
                  <EventCard event={event} />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        );

      case 'featured':
        return (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={Colors.light.premium} />
              <Text style={styles.sectionTitle}>Plan destacado</Text>
            </View>
            
            {item.data.length > 0 && (
              <View style={styles.featuredContainer}>
                <View style={styles.mainPlanContainer}>
                  <PlanCard plan={item.data[0]} horizontal={false} />
                </View>
                
                {item.data.length > 1 && (
                  <View style={styles.nextPlanHint}>
                    <Text style={styles.nextPlanText}>Siguiente plan</Text>
                    <View style={styles.nextPlanPreview}>
                      <PlanCard plan={item.data[1]} horizontal={false} />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        );

      case 'topPlans':
        return (
          <Animated.View entering={FadeInUp.delay(500)}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={Colors.light.premium} />
              <Text style={styles.sectionTitle}>Más planes populares</Text>
            </View>
            {isLoading ? (
              <FlatList
                data={[1, 2, 3]}
                renderItem={() => <PlanCardSkeleton horizontal={true} />}
                keyExtractor={(item) => item.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              />
            ) : item.data.length > 0 ? (
              <FlatList
                data={item.data}
                renderItem={({ item: plan, index }) => (
                  <Animated.View entering={FadeInUp.delay(600 + index * 100)}>
                    <PlanCard plan={plan} horizontal={true} />
                  </Animated.View>
                )}
                keyExtractor={(plan) => plan.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              />
            ) : (
              <EmptyState
                type="plans"
                title="No hay planes populares"
                subtitle="¡Sé el primero en crear un parche que se vuelva popular!"
                onAction={() => {
                  Toast.show({
                    type: 'info',
                    text1: 'Crear parche',
                    text2: 'Te llevamos al formulario',
                    position: 'bottom',
                    visibilityTime: 1500,
                  });
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
            <FlatList
              data={categories}
              renderItem={({ item: category, index }) => (
                <Animated.View entering={FadeInUp.delay(700 + index * 50)}>
                  <CategoryButton
                    category={category}
                    selected={selectedCategory === category.name}
                    onPress={() => handleCategoryPress(category.name)}
                  />
                </Animated.View>
              )}
              keyExtractor={(category) => category.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContent}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            />
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
              <View style={styles.filteredPlansContainer}>
                {[1, 2, 3].map((item) => (
                  <PlanCardSkeleton key={item} horizontal={false} />
                ))}
              </View>
            ) : item.data.length > 0 ? (
              <View style={styles.filteredPlansContainer}>
                {item.data.map((plan, index) => (
                  <Animated.View key={plan.id} entering={FadeInUp.delay(900 + index * 100)}>
                    <PlanCard plan={plan} horizontal={false} />
                  </Animated.View>
                ))}
              </View>
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
                  Toast.show({
                    type: 'success',
                    text1: 'Filtros limpiados ✅',
                    text2: 'Mostrando todos los planes',
                    position: 'bottom',
                    visibilityTime: 2000,
                  });
                }}
                onAction={() => {
                  Toast.show({
                    type: 'info',
                    text1: 'Crear parche',
                    text2: 'Te llevamos al formulario',
                    position: 'bottom',
                    visibilityTime: 1500,
                  });
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

      {/* Expandable FAB */}
      <ExpandableFAB position="bottom-right" />
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  contentContainer: {
    paddingBottom: 120,
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
  
  // Events Section - Responsive layout
  eventsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    justifyContent: 'space-between',
  },
  
  // Top Plans Section - Improved horizontal scrolling
  topPlansContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
  },
  
  // Categories Section - Better responsive grid
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  
  // Filtered Plans Section - Grid layout with proper spacing
  filteredPlansContainer: {
    paddingHorizontal: 20,
    gap: 16,
    flexDirection: 'column',
  },
  filteredPlansSection: {
    marginBottom: 32, // Increased bottom spacing
  },
  
  // Horizontal Lists - Consistent padding
  horizontalListContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra padding for last item
  },
  
  // Featured Section - Improved layout
  featuredSection: {
    marginBottom: 32,
  },
  featuredContainer: {
    minHeight: 400,
    paddingHorizontal: 20,
    flexDirection: 'column',
  },
  mainPlanContainer: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextPlanHint: {
    height: 120,
    opacity: 0.8,
    marginTop: 8,
  },
  nextPlanText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginBottom: 6,
    paddingLeft: 4,
    fontWeight: '500',
  },
  nextPlanPreview: {
    flex: 1,
    transform: [{ scale: 0.95 }],
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Bottom spacing for FAB
  bottomSpacing: {
    height: 40,
  },
});