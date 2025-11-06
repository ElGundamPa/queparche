import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import PatchCard from './PatchCard';
import theme from '@/lib/theme';
import { mockPatches, Patch } from '@/mocks/patches';
import { extractZoneFromLocationString } from '@/lib/zone-utils';

const { width, height } = Dimensions.get('window');

const PatchesScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Animaciones de entrada
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);
  const categoriesOpacity = useSharedValue(0);
  const categoriesTranslateY = useSharedValue(20);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(30);
  
  // Parallax scroll
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const categories = [
    { id: 'Todos', name: 'Todos', icon: '🏠' },
    { id: 'Restaurantes', name: 'Restaurantes', icon: '🍽️' },
    { id: 'Rooftops', name: 'Rooftops', icon: '🌇' },
    { id: 'Planes Gratis', name: 'Planes Gratis', icon: '🎭' },
    { id: 'Cultura', name: 'Cultura', icon: '🖼️' },
    { id: 'Naturaleza', name: 'Naturaleza', icon: '🌿' },
    { id: 'Vida Nocturna', name: 'Vida Nocturna', icon: '🌃' },
    { id: 'Shopping', name: 'Shopping', icon: '🛍️' },
  ];

  // Usar mock de parches
  const patches = mockPatches;

  const filteredPatches = patches.filter(patch => {
    const matchesCategory = selectedCategory === 'Todos' || patch.category === selectedCategory;
    const matchesSearch = patch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patch.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  // Animaciones de entrada
  useEffect(() => {
    // Secuencia de animaciones de entrada
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    
    searchOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    searchTranslateY.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
    
    categoriesOpacity.value = withDelay(400, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    categoriesTranslateY.value = withDelay(400, withSpring(0, { damping: 15, stiffness: 100 }));
    
    cardsOpacity.value = withDelay(600, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
    cardsTranslateY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  const handlePatchPress = (patch: Patch) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navegar a la zona correspondiente
    const zoneKey = extractZoneFromLocationString(patch.location);
    router.push({ pathname: '/zones/[zone]', params: { zone: zoneKey } });
  };

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

  const categoriesStyle = useAnimatedStyle(() => ({
    opacity: categoriesOpacity.value,
    transform: [{ translateY: categoriesTranslateY.value }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsTranslateY.value }],
  }));


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.mainTitle}>Encuentra tu Parche Perfecto</Text>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View style={[styles.searchContainer, searchStyle]}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar parches..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View style={[styles.categoriesContainer, categoriesStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Patches List */}
      <Animated.View style={[styles.patchesContainer, cardsStyle]}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.patchesScroll}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {filteredPatches.map((patch, index) => (
            <Animated.View key={patch.id} entering={Animated.FadeInUp.delay(600 + index * 80)}>
              <PatchCard
                patch={patch}
                onPress={() => handlePatchPress(patch)}
                delay={index * 60}
              />
            </Animated.View>
          ))}
        </Animated.ScrollView>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    backgroundColor: '#1A1A1A',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontSize: 18,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'sans-serif-medium',
        fontWeight: '700',
      },
    }),
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: theme.colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'sans-serif',
        fontWeight: '400',
      },
    }),
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
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
  categoryTextActive: {
    color: theme.colors.background,
  },
  patchesContainer: {
    flex: 1,
  },
  patchesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});

export default PatchesScreen;
