import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import theme from '@/lib/theme';
import { ZONES, MEDELLIN_COMUNAS } from '@/data/zones';
import AreaCard from '@/components/AreaCard';
import { useFilters } from '@/store/filters';
import { Image as ExpoImage, type ImageSource } from 'expo-image';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, FadeInUp } from 'react-native-reanimated';

function extractUri(src?: ImageSource): string | undefined {
  if (!src) return undefined;
  if (typeof src === 'string') return src;
  const anySrc = src as unknown as { uri?: string };
  return anySrc?.uri;
}

export default function ZoneDetail() {
  const { zone } = useLocalSearchParams<{ zone: string }>();
  const router = useRouter();
  const { width } = Dimensions.get('window');

  const zoneKey = useMemo(() => String(zone || '').toLowerCase().trim(), [zone]);
  const zoneItem = useMemo(() => ZONES.find((z) => String(z.key).toLowerCase().trim() === zoneKey), [zoneKey]);

  const areas = useMemo(() => {
    if (zoneKey === 'medellin') return MEDELLIN_COMUNAS;
    return [];
  }, [zoneKey]);

  useEffect(() => {
    if (zoneKey !== 'medellin') return;
    try {
      const first = MEDELLIN_COMUNAS.slice(0, 6);
      first.forEach((a) => {
        const uri = extractUri(a.image);
        if (uri) {
          ExpoImage.prefetch(uri).catch((e) => console.log('Comunas prefetch error', e?.message));
        }
      });
    } catch (e: any) {
      console.log('Comunas prefetch failed', e?.message);
    }
  }, [zoneKey]);

  const { setZone, setComuna } = useFilters();

  const onAreaPress = useCallback((slug: string) => {
    if (!zoneItem) return;
    setZone(zoneItem.key);
    setComuna(slug);
    router.push('/(tabs)');
  }, [router, zoneItem, setZone, setComuna]);

  if (!zoneItem) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Zona no encontrada' }} />
        <View style={{ padding: 16 }}>
          <Text style={styles.empty}>Zona no encontrada</Text>
          <View style={{ height: 12 }} />
          <Text style={styles.empty}>Verifica tu conexión o vuelve a intentarlo.</Text>
          <View style={{ height: 20 }} />
          <Text onPress={() => router.back()} style={{ color: theme.colors.primary, fontWeight: '700' }} accessibilityRole="button">
            ← Volver
          </Text>
        </View>
      </View>
    );
  }

  // Parallax y stagger
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, 120], [0, -40], 'clamp') }],
  }));

  // Stagger mediante entering delays (sin hooks variables)

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: zoneItem.name }} />

      {/* Header con back y parallax */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{zoneItem.name}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.listContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {areas.map((item, index) => (
            <Animated.View key={item.key} style={styles.col} entering={FadeInUp.delay(350 + index * 70)}>
              <AreaCard
                title={item.name}
                image={item.image}
                onPress={() => onAreaPress(item.key)}
                testID={`area-${item.key}`}
              />
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  listContent: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  col: { width: '50%', padding: 6 },
  empty: { color: theme.colors.textSecondary, fontSize: 14 },
});
