import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { H2, Subtitle } from './typography';

export default function SectionHeader({ title, subtitle, onPressMore }:{
  title: string; subtitle?: string; onPressMore?: () => void;
}) {
  return (
    <View className="px-4 mt-6 mb-3 flex-row items-end justify-between">
      <View>
        <H2><Text>{title}</Text></H2>
        {subtitle ? <Subtitle className="mt-1"><Text>{subtitle}</Text></Subtitle> : null}
      </View>
      {onPressMore ? (
        <Pressable onPress={onPressMore} className="px-3 py-2 rounded-xl bg-bg-soft">
          <Subtitle className="text-brand"><Text>Ver más</Text></Subtitle>
        </Pressable>
      ) : null}
    </View>
  );
}
