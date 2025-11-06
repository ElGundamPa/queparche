import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ZONES } from '@/data/zones';
import { mockPlans } from '@/mocks/plans';
import { Plan } from '@/types/plan';
import PatchGridItem from '@/components/PatchGridItem';
import theme from '@/lib/theme';

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>¿Qué parche hay hoy en {zoneItem.name}? 🔥</Text>
          <Text style={styles.headerSubtitle}>Explora experiencias recomendadas en esta zona.</Text>
        </View>
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
    padding: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12, // Espaciado vertical entre filas
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
