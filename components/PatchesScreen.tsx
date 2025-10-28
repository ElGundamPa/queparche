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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import PatchCard from './PatchCard';
import PatchDetailModal from './PatchDetailModal';

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
  amenities: string[];
  isFavorite?: boolean;
}

const PatchesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatch, setSelectedPatch] = useState<Patch | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  
  // Animaciones de entrada
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const searchOpacity = useSharedValue(0);
  const searchTranslateY = useSharedValue(20);
  const categoriesOpacity = useSharedValue(0);
  const categoriesTranslateY = useSharedValue(20);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(30);
  
  // Animación de blur de fondo
  const blurIntensity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

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

  const patches: Patch[] = [
    {
      id: '1',
      name: 'La Taquería Urbana',
      location: 'El Poblado, Medellín',
      rating: 4.8,
      price: '$$',
      description: 'Comida mexicana moderna',
      category: 'Restaurantes',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      amenities: ['WiFi', 'Reservas', 'Terraza'],
    },
    {
      id: '2',
      name: 'Skyline Rooftop Bar',
      location: 'Laureles',
      rating: 4.9,
      price: '$$',
      description: 'Cócteles y vistas panorámicas',
      category: 'Rooftops',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      amenities: ['Música en vivo', 'Terraza', 'Vista panorámica'],
    },
    {
      id: '3',
      name: 'Picnic en el Jardín Botánico',
      location: 'Centro',
      rating: 4.6,
      price: 'Gratis',
      description: 'Familiar - Aire libre',
      category: 'Planes Gratis',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      amenities: ['Aire libre', 'Familiar', 'Naturaleza'],
    },
    {
      id: '4',
      name: 'Museo de Arte Moderno MAMM',
      location: 'Ciudad del Río',
      rating: 4.7,
      price: '$$',
      description: 'Arte, exposiciones y café cultural',
      category: 'Cultura',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      amenities: ['Exposiciones', 'Café', 'Cultura'],
    },
    {
      id: '5',
      name: 'Sendero de La Miel',
      location: 'Envigado',
      rating: 4.6,
      price: '$$',
      description: 'Caminata ecológica guiada',
      category: 'Naturaleza',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      amenities: ['Ecológico', 'Guía', 'Naturaleza'],
    },
    {
      id: '6',
      name: 'Bar El Social',
      location: 'Provenza',
      rating: 4.9,
      price: '$$$',
      description: 'DJ y cocteles exclusivos',
      category: 'Vida Nocturna',
      image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      amenities: ['DJ', 'Cocteles', 'Música'],
    },
    {
      id: '7',
      name: 'Viva Envigado',
      location: 'Envigado',
      rating: 4.5,
      price: '$$',
      description: 'Compras, cine y gastronomía',
      category: 'Shopping',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      amenities: ['Compras', 'Cine', 'Gastronomía'],
    },
  ];

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
    setSelectedPatch(patch);
    
    // Animación de blur y modal
    blurIntensity.value = withTiming(10, { duration: 300, easing: Easing.out(Easing.ease) });
    modalScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    modalOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    
    // Mostrar modal después de la animación
    setTimeout(() => {
      setIsDetailVisible(true);
    }, 150);
  };

  const handleCloseDetail = () => {
    // Animación de cierre
    blurIntensity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
    modalScale.value = withSpring(0.8, { damping: 15, stiffness: 100 });
    modalOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
    
    setTimeout(() => {
      setIsDetailVisible(false);
      setSelectedPatch(null);
    }, 300);
  };

  // Estilos animados
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
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

  const backgroundBlurStyle = useAnimatedStyle(() => ({
    opacity: blurIntensity.value / 10,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.patchesScroll}
        >
          {filteredPatches.map((patch, index) => (
            <PatchCard
              key={patch.id}
              patch={patch}
              onPress={() => handlePatchPress(patch)}
              delay={index * 100}
            />
          ))}
        </ScrollView>
      </Animated.View>

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
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
    backgroundColor: '#FFFFFF',
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
    color: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#FF4444',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
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
    color: '#FFFFFF',
  },
  patchesContainer: {
    flex: 1,
  },
  patchesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
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

export default PatchesScreen;
