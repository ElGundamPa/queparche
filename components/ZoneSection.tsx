import React, { useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const ZONES = ['Medellín','Bello','Itagüí','Envigado','Sabaneta','La Estrella','Copacabana'] as const;

export default function ZoneSection() {
  const router = useRouter();
  const render = useCallback(({ item }: { item: string }) => (
    <Pressable onPress={() => router.push({ pathname: '/zones/[zone]', params: { zone: encodeURIComponent(item) } })} style={{ width: 140, height: 90, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }} testID={`zone-${item}`}>
      <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{item}</Text>
    </Pressable>
  ), [router]);

  return (
    <View style={{ marginTop: 24 }}>
      <FlatList
        data={ZONES as unknown as string[]}
        keyExtractor={(z) => z}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={render}
      />
    </View>
  );
}
