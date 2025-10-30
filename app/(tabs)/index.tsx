import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ScrollView,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Calendar, Star, Crown, Search, Bell } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  useAnimatedScrollHandler,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";


import PlanCard from "@/components/PlanCard";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import FABSpeedDial from "@/components/FABSpeedDial";
import HorizontalCategories from "@/components/HorizontalCategories";
import ZoneSection from "@/components/ZoneSection";
import EmptyState from "@/components/EmptyState";
import { PlanCardSkeleton } from "@/components/SkeletonLoader";
import Logo3VB from "@/components/Logo3VB";
import PatchCard from "@/components/PatchCard";
import PatchDetailModal from "@/components/PatchDetailModal";
import theme from "@/lib/theme";
// use entering delays por item en lugar de hooks variables
import { categories } from "@/mocks/categories";
import { useFilteredPlans, usePlansStore, useTopPlans } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { useSearchStore } from "@/hooks/use-search-store";
import HorizontalCards from "@/components/HorizontalCards";
import { Image as ExpoImage } from "expo-image";

const { width, height } = Dimensions.get('window');



interface Patch {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
  amenities: string[];
  isFavorite?: boolean;
  latitude?: number;
  longitude?: number;
}

type SectionType = 
  | { type: 'header' }
  | { type: 'search' }
  | { type: 'patches'; data: Patch[] }
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
  
  // Estado para parches y modal
  const [selectedPatch, setSelectedPatch] = useState<Patch | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  
  // Animaciones de entrada
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);
  
  // Animación de blur de fondo
  const blurIntensity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  // Parallax global
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Datos de parches de ejemplo - Más parches para mejor experiencia
  const patches: Patch[] = [
    {
      id: '1',
      name: 'La Taquería Urbana',
      location: 'El Poblado, Medellín',
      rating: 4.8,
      price: '$$',
      description: 'Comida mexicana moderna con ingredientes frescos y auténticos sabores. Ambiente casual y acogedor perfecto para una cena con amigos.',
      category: 'Restaurantes',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      amenities: ['WiFi', 'Reservas', 'Terraza'],
      latitude: 6.2088,
      longitude: -75.5656,
    },
    {
      id: '2',
      name: 'Skyline Rooftop Bar',
      location: 'Laureles',
      rating: 4.9,
      price: '$$',
      description: 'Cócteles artesanales y vistas panorámicas de la ciudad. El lugar perfecto para disfrutar de un atardecer inolvidable con música en vivo.',
      category: 'Rooftops',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      images: [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      ],
      amenities: ['Música en vivo', 'Terraza', 'Vista panorámica'],
      latitude: 6.2442,
      longitude: -75.5812,
    },
    {
      id: '3',
      name: 'Picnic en el Jardín Botánico',
      location: 'Centro',
      rating: 4.6,
      price: 'Gratis',
      description: 'Disfruta de un día familiar rodeado de naturaleza. Perfecto para relajarse, hacer ejercicio o simplemente disfrutar del aire libre.',
      category: 'Planes Gratis',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      amenities: ['Aire libre', 'Familiar', 'Naturaleza'],
      latitude: 6.2442,
      longitude: -75.5812,
    },
    {
      id: '4',
      name: 'Museo de Arte Moderno MAMM',
      location: 'Ciudad del Río',
      rating: 4.7,
      price: '$$',
      description: 'Arte contemporáneo, exposiciones temporales y un café cultural único. Un espacio para la creatividad y la reflexión en el corazón de la ciudad.',
      category: 'Cultura',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      amenities: ['Exposiciones', 'Café', 'Cultura'],
      latitude: 6.2442,
      longitude: -75.5812,
    },
    {
      id: '5',
      name: 'Sendero de La Miel',
      location: 'Envigado',
      rating: 4.6,
      price: '$$',
      description: 'Caminata ecológica guiada por senderos naturales. Conecta con la naturaleza y descubre la biodiversidad de la región.',
      category: 'Naturaleza',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      amenities: ['Ecológico', 'Guía', 'Naturaleza'],
      latitude: 6.1667,
      longitude: -75.5833,
    },
    {
      id: '6',
      name: 'Bar El Social',
      location: 'Provenza',
      rating: 4.9,
      price: '$$$',
      description: 'DJ sets exclusivos y cócteles de autor en el corazón de la vida nocturna de Medellín. El lugar perfecto para una noche inolvidable.',
      category: 'Vida Nocturna',
      image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      amenities: ['DJ', 'Cocteles', 'Música'],
      latitude: 6.2088,
      longitude: -75.5656,
    },
    {
      id: '7',
      name: 'Centro Comercial Santafé',
      location: 'El Poblado',
      rating: 4.5,
      price: '$$',
      description: 'El centro comercial más exclusivo de Medellín con las mejores marcas internacionales, restaurantes gourmet y entretenimiento.',
      category: 'Shopping',
      image: 'https://images.unsplash.com/photo-1555529902-1a0a2a0a0a0a?w=800',
      amenities: ['Parking', 'WiFi', 'Restaurantes'],
      latitude: 6.2088,
      longitude: -75.5656,
    },
  ];

  const handleCategoryPress = (categoryName: string) => {
    Haptics.selectionAsync();
    const newCategory = selectedCategory === categoryName ? null : categoryName;
    setSelectedCategory(newCategory);
  };

  const handlePatchPress = (patch: Patch) => {
    setSelectedPatch(patch);
    
    // Fade in rápido sin rebote
    blurIntensity.value = withTiming(5, { duration: 150, easing: Easing.out(Easing.ease) });
    modalScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    modalOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    
    // Mostrar modal inmediatamente
    setIsDetailVisible(true);
  };

  const handleCloseDetail = () => {
    // Fade out rápido sin rebote
    blurIntensity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
    modalScale.value = withTiming(0.95, { duration: 150, easing: Easing.in(Easing.ease) });
    modalOpacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
    
    setTimeout(() => {
      setIsDetailVisible(false);
      setSelectedPatch(null);
    }, 150);
  };

  // Animaciones de entrada
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    
    searchOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    searchTranslateY.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  // Lanzar stagger para datasets horizontales
  useEffect(() => { startPatchStagger(); }, [patches.length]);
  useEffect(() => { startTopStagger(); }, [topPlans.length]);
  useEffect(() => { startFilteredStagger(); }, [filteredPlans.length]);

  // Estilos animados
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

  const backgroundBlurStyle = useAnimatedStyle(() => ({
    opacity: blurIntensity.value / 10,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));



  const todayEvents = events.filter(event => {
    const today = new Date().toDateString();
    const eventDate = new Date(event.startDate).toDateString();
    return today === eventDate;
  });

  const prefetchNextImages = useCallback((items: any[], startIndex: number, batch: number = 6) => {
    try {
      const slice = items.slice(startIndex, startIndex + batch);
      slice.forEach((it) => {
        const url = it?.images?.[0] || it?.image;
        if (typeof url === 'string' && url.length > 0) {
          ExpoImage.prefetch(url).catch((e) => console.log('prefetch error', e?.message));
        }
      });
    } catch (e: any) {
      console.log('prefetchNextImages error', e?.message);
    }
  }, []);

  const sections = useMemo((): SectionType[] => {
    const sectionList: SectionType[] = [
      { type: 'header' },
      { type: 'search' },
    ];

    // Agregar sección de parches destacados
    if (patches.length > 0) {
      sectionList.push({ type: 'patches', data: patches });
    }

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
  }, [patches, todayEvents, topPlans, filteredPlans]);

  // Stagger por item con entering delays (sin hooks variables)

  const renderSection: ListRenderItem<SectionType> = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerContent}>
              <View style={styles.profileSection}>
                <Image
                  source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
                  style={styles.profileImage}
                />
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.headerIcon}>
                  <Search size={18} color="#1A1A1A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIcon}>
                  <Bell size={18} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.greeting}>¿Que Parche {user?.name?.split(' ')[0] || 'Hay para hoy?'} 👋</Text>
              <Text style={styles.title}>¿Qué parche hay hoy en Medellín? 🔥</Text>
              <Text style={styles.subtitle}>Encuentra planes en segundos.</Text>
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
        );

      case 'search':
        return (
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
        );

      case 'patches':
        return (
          <Animated.View entering={FadeInUp.delay(300)}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>¿Qué parche hay hoy en Medellín? 🔥</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.patchesScroll}
            >
                  {item.data.map((patch, index) => (
                    <Animated.View key={patch.id} entering={FadeInUp.delay(350 + index * 70)}>
                      <View style={styles.patchCardContainer}>
                        <PatchCard
                          patch={patch}
                          onPress={() => handlePatchPress(patch)}
                          delay={index * 50}
                        />
                      </View>
                    </Animated.View>
                  ))}
            </ScrollView>
            <View style={styles.seeAllContainer}>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver todos los parches</Text>
                <Text style={styles.seeAllIcon}>→</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 'events':
        return (
          <Animated.View entering={FadeInUp.delay(300)}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={theme.colors.primary} />
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
              onEndReached={() => prefetchNextImages(item.data, 6)}
            />
          </Animated.View>
        );

      case 'featured':
        return (
          <Animated.View entering={FadeInUp.delay(400)}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={theme.colors.primary} />
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
              onEndReached={() => prefetchNextImages(item.data, 6)}
            />
          </Animated.View>
        );

      case 'topPlans':
        return (
          <Animated.View entering={FadeInUp.delay(500)}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={theme.colors.primary} />
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
                  <Animated.View entering={FadeInUp.delay(550 + index * 80)}>
                    <PlanCard plan={plan} horizontal={true} />
                  </Animated.View>
                )}
                keyExtractor={(plan) => plan.id}
                itemWidth={280}
                gap={16}
                contentPaddingHorizontal={20}
                testID="topplans-horizontal"
                onEndReached={() => prefetchNextImages(item.data, 6)}
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
                  <Animated.View entering={FadeInUp.delay(800 + index * 80)}>
                    <PlanCard plan={plan} horizontal={true} />
                  </Animated.View>
                )}
                keyExtractor={(plan) => plan.id}
                itemWidth={280}
                gap={16}
                contentPaddingHorizontal={20}
                testID="filtered-horizontal"
                onEndReached={() => prefetchNextImages(item.data, 6)}
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
      <Animated.FlatList
        data={sections}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Floating Action Button */}
      <FABSpeedDial />

      {/* Blur Background */}
      {isDetailVisible && (
        <Animated.View style={[styles.blurBackground, backgroundBlurStyle]}>
          <BlurView intensity={blurIntensity.value} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}

      {/* Detail Modal */}
      {isDetailVisible && selectedPatch && (
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <PatchDetailModal
            patch={selectedPatch}
            onClose={handleCloseDetail}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  contentContainer: {
    paddingBottom: 120, // Increased bottom padding for FAB
    flexGrow: 1, // Ensure content can grow
  },
  
  // Header Section - Clean and minimal design
  header: {
    paddingHorizontal: theme.spacing.horizontal,
    paddingTop: 60,
    paddingBottom: theme.spacing.vertical * 2,
    marginBottom: 8,
    minHeight: 100, // Optimized height
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
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
  titleSection: {
    marginBottom: 16,
  },
  greeting: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 28,
    flexShrink: 1, // Allow text to wrap if needed
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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
  
  // Section Headers - Consistent spacing
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing.section,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.horizontal,
    minHeight: 40, // Ensure minimum height for headers
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  
  // Events Section - Horizontal scroll
  eventCard: {
    width: 260,
    minWidth: 260,
  },
  
  // Top Plans Section - Improved horizontal scrolling
  topPlansContainer: {
    paddingHorizontal: theme.spacing.horizontal,
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
    paddingHorizontal: theme.spacing.horizontal,
    paddingRight: 40, // Extra padding for last item
  },
  horizontalPlanCard: {
    width: 280, // Fixed width for consistent card sizing
    minWidth: 280, // Ensure minimum width
  },
  
  // Horizontal Lists - Consistent padding
  horizontalListContent: {
    paddingHorizontal: theme.spacing.horizontal,
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
  
  // Search Container
  searchContainer: {
    paddingHorizontal: theme.spacing.horizontal,
    marginBottom: theme.spacing.section,
  },
  
  // Patches Section
  patchesScroll: {
    paddingHorizontal: theme.spacing.horizontal,
    gap: 16,
  },
  patchCardContainer: {
    width: 280,
    marginRight: 16,
  },
  seeAllContainer: {
    paddingHorizontal: theme.spacing.horizontal,
    marginTop: 16,
    alignItems: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.button,
  },
  seeAllText: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginRight: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '600',
      },
    }),
  },
  seeAllIcon: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Modal and Blur
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
});