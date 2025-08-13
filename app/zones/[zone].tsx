import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Colors from '@/constants/colors';
import HorizontalCards from '@/components/HorizontalCards';
import PlanCard from '@/components/PlanCard';
import { plansByZone } from '@/data/parches';

export default function ZoneDetail() {
  const { zone } = useLocalSearchParams<{ zone: string }>();
  const decoded = useMemo(() => decodeURIComponent(zone || ''), [zone]);

  const zoneContent = useMemo(() => {
    if (decoded === 'Medellín') {
      return { type: 'med', data: plansByZone.Medellín } as const;
    }
    const key = decoded as keyof typeof plansByZone;
    if (key in plansByZone) {
      return { type: 'other', data: plansByZone[key] } as const;
    }
    return { type: 'none' } as const;
  }, [decoded]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: decoded || 'Zona', headerStyle: { backgroundColor: Colors.light.background }, headerTintColor: Colors.light.text }} />
      {zoneContent.type === 'med' ? (
        Object.entries(zoneContent.data).map(([comuna, plans]) => (
          <View key={comuna} style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>{comuna}</Text>
            <HorizontalCards
              data={plans}
              keyExtractor={(p) => p.id}
              itemWidth={280}
              renderItem={({ item }) => <PlanCard plan={item} horizontal={true} />}
              gap={16}
              contentPaddingHorizontal={20}
              enableSnap
              testID={`zone-${comuna}`}
            />
          </View>
        ))
      ) : zoneContent.type === 'other' && Array.isArray(zoneContent.data) ? (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>{decoded}</Text>
          <HorizontalCards
            data={zoneContent.data}
            keyExtractor={(p) => p.id}
            itemWidth={280}
            renderItem={({ item }) => <PlanCard plan={item} horizontal={true} />}
            gap={16}
            contentPaddingHorizontal={20}
            enableSnap
            testID={`zone-${decoded}`}
          />
        </View>
      ) : (
        <View style={{ padding: 20 }}>
          <Text style={styles.empty}>No encontramos datos para esta zona.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.text, paddingHorizontal: 20, marginBottom: 12 },
  empty: { color: Colors.light.darkGray, fontSize: 14 },
});
