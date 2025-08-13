import React from 'react';
import { Pressable, Text } from 'react-native';

export default function CategoryChip({ label, selected, onPress }:{
  label: string; selected?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-3 ${selected ? 'bg-brand' : 'bg-bg-soft'} shadow-soft`}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`chip-${label}`}
    >
      <Text className={`${selected ? 'text-white' : 'text-text-secondary'} font-medium`}>{label}</Text>
    </Pressable>
  );
}
