import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ZONES } from '@/data/zones';
import { mockPlans } from '@/mocks/plans';
import { Plan } from '@/types/plan';
import PatchGridItem from '@/components/PatchGridItem';

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

// Función para extraer zona desde la dirección
const extractZoneFromAddress = (address?: string): string | null => {
  if (!address) return null;
  const normalizedAddress = normalizeZoneName(address);
  
  for (const zone of ZONES) {
    const normalizedZoneName = normalizeZoneName(zone.name);
    if (normalizedAddress.includes(normalizedZoneName)) {
      return zone.name;
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
    },
    description: `Explora experiencias únicas en ${zoneName}. Próximamente más parches subidos por la comunidad.`,
    category: 'Experiencias',
    maxPeople: 30,
    currentPeople: 0,
    images: [`https://source.unsplash.com/random/1080x720/?${encodeURIComponent(normalizedZone)},city,night`],
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
    
    const filtered = mockPlans.filter((plan) => {
      const planZone = extractZoneFromAddress(plan.location.address);
      return planZone === zoneItem.name;
    });
    
    // Si no hay planes, crear un placeholder
    if (filtered.length === 0) {
      return [createPlaceholderPlan(zoneItem.name)];
    }
    
    return filtered;
  }, [zoneItem]);

  const handlePlanPress = (plan: Plan) => {
    // En la página de zona, al tocar un plan, navegar a su detalle
    router.push(`/plan/${plan.id}`);
  };

  const renderItem = ({ item }: { item: Plan }) => {
    return (
      <PatchGridItem plan={item} onPress={() => handlePlanPress(item)} />
    );
  };

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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{zoneItem.name}</Text>
        <View style={styles.placeholder} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  listContent: { 
    padding: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 0,
    gap: 12, // Espaciado horizontal entre items
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
