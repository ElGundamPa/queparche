import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import { Pressable, View, ViewStyle, Animated, Easing, Platform, Text, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, MessageSquare, Wand2, CalendarPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { plansByZone } from '@/data/parches';

interface FABSpeedDialProps {
  style?: ViewStyle;
}

const ActionButton = memo(function ActionButton({ icon, label, onPress, delay=0 }:{ icon: React.ReactNode; label: string; onPress: () => void; delay?: number; }){
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, delay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 220, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [opacity, translate, delay]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY: translate }] }}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }} testID={`fab-action-${label}`}>
        <View style={{ backgroundColor: Colors.light.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: Colors.light.border }}>
          <Text style={{ color: Colors.light.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF4444', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default function FABSpeedDial({ style }: FABSpeedDialProps) {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const pulse = useRef(new Animated.Value(0)).current;
  const mainScale = useRef(new Animated.Value(1)).current;
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const handleToggle = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    Animated.sequence([
      Animated.timing(mainScale, { toValue: 0.92, duration: 90, useNativeDriver: true }),
      Animated.timing(mainScale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start(() => setOpen((v) => !v));
  }, [mainScale]);

  const goRandom = () => {
    const pools = [
      ...plansByZone.MedellínAll,
      ...plansByZone.Bello,
      ...plansByZone.Itagüí,
      ...plansByZone.Envigado,
      ...plansByZone.Sabaneta,
      ...plansByZone['La Estrella'],
      ...plansByZone.Copacabana,
    ];
    if (pools.length > 0) {
      const pick = pools[Math.floor(Math.random() * pools.length)];
      setOpen(false);
      router.push(`/plan/${pick.id}`);
    }
  };

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.45] });

  return (
    <View pointerEvents="box-none" style={[{ position: 'absolute', right: 16, bottom: Math.max(16, bottom + 12) }, style]}>
      {open ? (
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={{ position: 'absolute', right: -16, bottom: -12, left: -1000, top: -1000 }} />
        </TouchableWithoutFeedback>
      ) : null}

      <View style={{ alignItems: 'flex-end', marginBottom: 12 }}>
        {open && (
          <>
            <ActionButton icon={<MessageSquare size={20} color={Colors.light.white} />} label="AI Chat" onPress={() => { setOpen(false); router.push('/ai-assistant'); }} delay={0} />
            <ActionButton icon={<CalendarPlus size={20} color={Colors.light.white} />} label="Crear mi plan" onPress={() => { setOpen(false); router.push('/create'); }} delay={50} />
            <ActionButton icon={<Wand2 size={20} color={Colors.light.white} />} label="Parche random" onPress={goRandom} delay={100} />
          </>
        )}
      </View>

      <Animated.View style={{ transform: [{ scale: pulseScale }, { scale: mainScale }], shadowColor: '#FF4444', shadowOpacity: glow as unknown as number, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}>
        <Pressable onPress={handleToggle} accessibilityRole="button" accessibilityLabel="Abrir acciones rápidas" style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF4444', alignItems: 'center', justifyContent: 'center' }} testID="floating-action-button">
          <Plus size={24} color={Colors.light.white} strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
