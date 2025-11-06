import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const ZONES = [
  { key: 'medellin', label: 'Medellín' },
  { key: 'laureles', label: 'Laureles' },
  { key: 'el-poblado', label: 'El Poblado' },
  { key: 'sabaneta', label: 'Sabaneta' },
  { key: 'itagui', label: 'Itagüí' },
  { key: 'envigado', label: 'Envigado' },
  { key: 'copacabana', label: 'Copacabana' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ZoneChipProps {
  label: string;
  onPress: () => void;
  active?: boolean;
}

const ZoneChip = memo(({ label, onPress, active = false }: ZoneChipProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.94, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 220 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.chip,
        animatedStyle,
        active ? styles.chipActive : styles.chipInactive,
      ]}
    >
      <Text style={[styles.chipText, active ? styles.textActive : styles.textInactive]}>
        {label}
      </Text>
    </AnimatedTouchable>
  );
});

interface ZoneSelectorProps {
  selectedZone?: string;
  onZoneSelect?: (zone: string) => void;
  navigateOnPress?: boolean;
}

const ZoneSelector = ({ 
  selectedZone = 'medellin', 
  onZoneSelect,
  navigateOnPress = false 
}: ZoneSelectorProps) => {
  const router = useRouter();

  const handleZonePress = (zoneKey: string) => {
    if (navigateOnPress) {
      router.push(`/zones/${zoneKey}`);
    } else if (onZoneSelect) {
      onZoneSelect(zoneKey);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ZONES.map((zone) => (
        <ZoneChip
          key={zone.key}
          label={zone.label}
          active={zone.key === selectedZone}
          onPress={() => handleZonePress(zone.key)}
        />
      ))}
    </ScrollView>
  );
};

export default memo(ZoneSelector);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 10,
    backgroundColor: '#0B0B0B',
  },
  chipInactive: {
    borderColor: '#2A2A2A',
  },
  chipActive: {
    borderColor: '#FF3B30',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textInactive: {
    color: '#CFCFCF',
  },
  textActive: {
    color: '#FF3B30',
  },
});

