import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ZONES } from '@/data/zones';
import ZoneCard from '@/components/ZoneCard';
import Colors from '@/constants/colors';
import { Image as ExpoImage, type ImageSource } from 'expo-image';
import { ArrowLeft } from 'lucide-react-native';

function extractUri(src?: ImageSource): string | undefined {
  if (!src) return undefined;
  if (typeof src === 'string') return src;
  const anySrc = src as unknown as { uri?: string };
  return anySrc?.uri;
}

export default function ZonesIndexScreen() {
  const router = useRouter();

  const zones = useMemo(() => ZONES, []);

  useEffect(() => {
    try {
      const first = zones.slice(0, 6);
      console.log('[ZonesIndex] prefetch zone images', first.map((z) => z.key));
      first.forEach((z) => {
        const uri = extractUri(z.image);
        if (uri) {
          ExpoImage.prefetch(uri).catch((e) => console.log('Zones prefetch error', e?.message));
        }
      });
    } catch (e: any) {
      console.log('Zones prefetch failed', e?.message);
    }
  }, [zones]);

  const onPressZone = useCallback(
    (zKey: string) => {
      console.log('[ZonesIndex] press zone', { zKey });
      router.push({ pathname: '/zones/[zone]', params: { zone: zKey } });
    },
    [router]
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Parches por zona' }} />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parches por zona</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} testID="zones-grid">
        {zones.map((z) => (
          <Pressable key={z.key} onPress={() => onPressZone(z.key)} accessibilityRole="button" accessibilityLabel={`Abrir ${z.name}`} testID={`zone-${z.key}`} style={styles.item}>
            <ZoneCard title={z.name} image={z.image} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
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
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  } as const,
  item: {
    width: 156,
    height: 156,
  },
});
