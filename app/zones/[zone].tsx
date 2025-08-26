import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ZONES, MEDELLIN_COMUNAS } from '@/data/zones';
import { FlashList } from '@shopify/flash-list';
import AreaCard from '@/components/AreaCard';
import { useFilters } from '@/store/filters';
import { Image as ExpoImage, type ImageSource } from 'expo-image';

function extractUri(src?: ImageSource): string | undefined {
  if (!src) return undefined;
  if (typeof src === 'string') return src;
  const anySrc = src as unknown as { uri?: string };
  return anySrc?.uri;
}

export default function ZoneDetail() {
  const { zone } = useLocalSearchParams<{ zone: string }>();
  const router = useRouter();

  const zoneKey = useMemo(() => String(zone || ''), [zone]);
  const zoneItem = useMemo(() => ZONES.find((z) => z.key === zoneKey), [zoneKey]);

  const areas = useMemo(() => {
    if (zoneKey === 'medellin') return MEDELLIN_COMUNAS;
    return [];
  }, [zoneKey]);

  useEffect(() => {
    if (zoneKey !== 'medellin') return;
    try {
      const first = MEDELLIN_COMUNAS.slice(0, 6);
      console.log('[ZoneDetail] prefetch comunas images', first.map((a) => a.key));
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
        <View style={{ padding: 20 }}>
          <Text style={styles.empty}>Zona no encontrada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: zoneItem.name }} />

      <FlashList
        data={areas}
        numColumns={2}
        estimatedItemSize={150}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.col}>
            <AreaCard
              title={item.name}
              image={item.image}
              onPress={() => onAreaPress(item.key)}
              testID={`area-${item.key}`}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={styles.empty}>Pronto verás los barrios y sectores de {zoneItem?.name ?? 'esta zona'}.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  listContent: { padding: 16, gap: 12 },
  col: { width: '50%', padding: 6 },
  empty: { color: Colors.light.darkGray, fontSize: 14 },
});
