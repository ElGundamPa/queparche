import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  ListRenderItem,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Shuffle, MapPin, Calendar, Star, Crown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import CategoryButton from "@/components/CategoryButton";
import PlanCard from "@/components/PlanCard";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import Colors from "@/constants/colors";
import { categories } from "@/mocks/categories";
import { useFilteredPlans, usePlansStore, useTopPlans } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";

const { width } = Dimensions.get("window");

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
  const router = useRouter();
  const { selectedCategory, setSelectedCategory, getRandomPlan, events } = usePlansStore();
  const { user } = useUserStore();
  const { searchQuery, performSearch, filteredPlans: searchFilteredPlans } = useSearchStore();
  const topPlans = useTopPlans();
  const defaultFilteredPlans = useFilteredPlans();
  const filteredPlans = searchQuery ? searchFilteredPlans : defaultFilteredPlans;

  const handleCategoryPress = (categoryName: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const handleRandomPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const randomPlan = getRandomPlan();
    
    if (randomPlan) {
      router.push(`/plan/${randomPlan.id}`);
    } else {
      Alert.alert(
        "No hay planes disponibles",
        "No hay planes que coincidan con tus criterios. ¡Intenta cambiar tu filtro de categoría o crea un nuevo plan!"
      );
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
        );

      case 'search':
        return (
          <SearchBar
            value={searchQuery}
            onChangeText={performSearch}
            placeholder="Buscar planes, lugares, eventos..."
            showSuggestions={true}
            showFilter={true}
            onFilterPress={() => {
              // TODO: Implement filter modal
              console.log('Filter pressed');
            }}
          />
        );

      case 'events':
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Eventos de hoy</Text>
            </View>
            <View style={styles.eventsContainer}>
              {item.data.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>
          </View>
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
          <View>
            <View style={styles.sectionHeader}>
              <Star size={20} color={Colors.light.premium} />
              <Text style={styles.sectionTitle}>Más planes populares</Text>
            </View>
            <View style={styles.topPlansContainer}>
              {item.data.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </View>
          </View>
        );

      case 'categories':
        return (
          <View>
            <Text style={styles.sectionTitle}>Explorar por categoría</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  selected={selectedCategory === category.name}
                  onPress={() => handleCategoryPress(category.name)}
                />
              ))}
            </View>
          </View>
        );

      case 'filteredPlans':
        return (
          <View>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? "Resultados"
                : selectedCategory
                ? `Planes de ${selectedCategory}`
                : "Todos los planes"}
            </Text>
            <View style={styles.filteredPlansContainer}>
              {item.data.map((plan) => (
                <PlanCard key={plan.id} plan={plan} horizontal={false} />
              ))}
            </View>
          </View>
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

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        {/* AI Assistant Button */}
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => router.push('/ai-assistant')}
          testID="ai-assistant-button"
        >
          <Text style={styles.aiButtonIcon}>🤖</Text>
        </TouchableOpacity>
        
        {/* Random Parche Button - Minimalist */}
        <TouchableOpacity
          style={styles.randomButtonMinimal}
          onPress={handleRandomPlan}
          testID="random-plan-button"
        >
          <Shuffle size={18} color={Colors.light.primary} />
        </TouchableOpacity>
        
        {/* Location Button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => router.push('/map')}
        >
          <MapPin size={18} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.darkGray,
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
    backgroundColor: Colors.light.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  eventsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
  },
  topPlansContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filteredPlansContainer: {
    paddingHorizontal: 20,
  },
  featuredSection: {
    marginBottom: 20,
  },
  featuredContainer: {
    height: 400,
    paddingHorizontal: 20,
  },
  mainPlanContainer: {
    height: '70%',
    marginBottom: 8,
  },
  nextPlanHint: {
    height: '30%',
    opacity: 0.7,
  },
  nextPlanText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginBottom: 4,
    paddingLeft: 4,
  },
  nextPlanPreview: {
    flex: 1,
    transform: [{ scale: 0.9 }],
  },
  bottomSpacing: {
    height: 20,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "center",
    gap: 12,
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  aiButtonIcon: {
    fontSize: 20,
  },
  randomButtonMinimal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
});