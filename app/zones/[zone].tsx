import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ZONES } from '@/data/zones';
import { mockPlans } from '@/mocks/plans';
import { Plan } from '@/types/plan';
import PatchGridItem from '@/components/PatchGridItem';
import theme from '@/lib/theme';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

// Función para normalizar nombres de zona
const normalizeZoneName = (zoneName: string): string => {
  return zoneName.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .trim();
};

// Función para obtener la zona/ciudad de un plan
const getPlanZone = (plan: Plan): string | null => {
  // Prioridad: zone > city > extraer desde address
  if (plan.location.zone) {
    return plan.location.zone;
  }
  if (plan.location.city) {
    return plan.location.city;
  }
  // Fallback: extraer desde address si no hay zone/city
  if (plan.location.address) {
    const normalizedAddress = normalizeZoneName(plan.location.address);
    for (const zone of ZONES) {
      const normalizedZoneName = normalizeZoneName(zone.name);
      if (normalizedAddress.includes(normalizedZoneName)) {
        return zone.name;
      }
    }
  }
  return null;
};

// Función para crear un plan placeholder
const createPlaceholderPlan = (zoneName: string): Plan => {
  const normalizedZone = normalizeZoneName(zoneName);
  return {
    id: `placeholder-${normalizedZone}`,
    name: `Plan recomendado en ${zoneName}`,
    location: {
      latitude: 6.2442,
      longitude: -75.5812,
      address: `${zoneName}, Colombia`,
      city: zoneName,
    },
    description: `Explora experiencias únicas en ${zoneName}. Próximamente más parches subidos por la comunidad.`,
    category: 'Experiencias',
    maxPeople: 30,
    currentPeople: 0,
    images: [`https://source.unsplash.com/600x600/?${encodeURIComponent(normalizedZone)},city,night`],
    createdAt: new Date().toISOString(),
    createdBy: 'Sistema',
    userId: 'system',
    likes: 0,
    favorites: 0,
    rating: 0,
    reviewCount: 0,
    price: 0,
    priceType: 'free',
    tags: ['Ambiente agradable', 'Espacios abiertos'],
  };
};

export default function ZoneDetail() {
  const { zone } = useLocalSearchParams<{ zone: string }>();
  const router = useRouter();

  // Normalizar el parámetro de zona (puede venir como "Medellin" o "Medellín")
  const zoneKey = useMemo(() => {
    const param = String(zone || '').trim();
    // Buscar la zona que coincida (por key o por name)
    const found = ZONES.find((z) => 
      z.key.toLowerCase() === param.toLowerCase() || 
      normalizeZoneName(z.name) === normalizeZoneName(param)
    );
    return found ? found.key : param.toLowerCase();
  }, [zone]);

  const zoneItem = useMemo(() => 
    ZONES.find((z) => z.key.toLowerCase() === zoneKey), 
    [zoneKey]
  );

  // Filtrar planes por zona
  const zonePlans = useMemo(() => {
    if (!zoneItem) return [];
    
    const normalizedZoneName = normalizeZoneName(zoneItem.name);
    
    const filtered = mockPlans.filter((plan) => {
      const planZone = getPlanZone(plan);
      if (!planZone) return false;
      const normalizedPlanZone = normalizeZoneName(planZone);
      return normalizedPlanZone === normalizedZoneName;
    });
    
    // Si no hay planes, crear un placeholder
    if (filtered.length === 0) {
      return [createPlaceholderPlan(zoneItem.name)];
    }
    
    return filtered;
  }, [zoneItem]);

  const handlePlanPress = (plan: Plan) => {
    // Si es placeholder, no navegar
    if (plan.id.startsWith('placeholder-')) {
      return;
    }
    // Navegar al detalle del plan
    router.push(`/plan/${plan.id}`);
  };

  const renderItem = ({ item, index }: { item: Plan; index: number }) => {
    return (
      <PatchGridItem 
        plan={item} 
        onPress={() => handlePlanPress(item)} 
        index={index}
      />
    );
  };

  // Obtener imagen de la zona para el hero header
  const zoneImageUrl = useMemo(() => {
    if (!zoneItem?.image) {
      return `https://source.unsplash.com/800x600/?${encodeURIComponent(zoneItem?.name || 'city')},city,night`;
    }
    // Si es un objeto ImageSource, extraer la URI
    if (typeof zoneItem.image === 'string') {
      return zoneItem.image;
    }
    if (zoneItem.image && 'uri' in zoneItem.image) {
      return zoneItem.image.uri || `https://source.unsplash.com/800x600/?${encodeURIComponent(zoneItem?.name || 'city')},city,night`;
    }
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(zoneItem?.name || 'city')},city,night`;
  }, [zoneItem]);

  if (!zoneItem) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Zona no encontrada' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Zona no encontrada</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: zoneItem.name }} />

      {/* Hero Header */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: zoneImageUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
          style={styles.heroGradient}
        />
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.heroBackButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Hero Content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>¿Qué parche hay hoy en {zoneItem.name}? 🔥</Text>
          <Text style={styles.heroSubtitle}>Explora experiencias recomendadas en esta zona.</Text>
          
          {/* Map Button */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => router.push(`/map?zone=${encodeURIComponent(zoneItem.name)}`)}
          >
            <MapPin size={16} color="#FFFFFF" />
            <Text style={styles.mapButtonText}>Ver en el mapa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid de planes */}
      <FlatList
        data={zonePlans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={12}
        windowSize={7}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay planes disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0E0E0E',
  },
  // Hero Header Styles
  heroContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    lineHeight: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Legacy styles (keep for error states)
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#0E0E0E',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: '#A1A1A1',
    marginBottom: 16,
  },
  placeholder: {
    width: 40,
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemLastInRow: {
    marginRight: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#999999',
    fontSize: 16,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999999',
    fontSize: 14,
  },
});
