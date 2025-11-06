import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { Plus, X, Bot, Shuffle, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { usePlansStore } from '@/hooks/use-plans-store';

interface ExpandableFABProps {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export default function ExpandableFAB({ position = 'bottom-right' }: ExpandableFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const router = useRouter();
  const { getRandomPlan } = usePlansStore();

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleRandomPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const randomPlan = getRandomPlan();
    
    if (randomPlan) {
      router.push(`/plan/${randomPlan.id}`);
    }
    
    toggleExpanded();
  };

  const handleAIAssistant = () => {
    Haptics.selectionAsync();
    router.push('/ai-assistant');
    toggleExpanded();
  };

  const handleMap = () => {
    Haptics.selectionAsync();
    router.push('/map');
    toggleExpanded();
  };

  const getContainerStyle = () => {
    switch (position) {
      case 'bottom-left':
        return { ...styles.container, left: 20 };
      case 'bottom-center':
        return { ...styles.container, alignSelf: 'center' };
      default:
        return { ...styles.container, right: 20 };
    }
  };

  const buttonScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const buttonOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const buttonTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const mainButtonRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={getContainerStyle()}>
      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionButton,
          {
            transform: [
              { scale: buttonScale },
              { translateY: buttonTranslateY },
            ],
            opacity: buttonOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButtonInner}
          onPress={handleAIAssistant}
          testID="fab-ai-button"
        >
          <Bot size={20} color={Colors.light.primary} />
          <Text style={styles.actionButtonText}>AI</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.actionButton,
          {
            transform: [
              { scale: buttonScale },
              { translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -120],
              }) },
            ],
            opacity: buttonOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButtonInner}
          onPress={handleRandomPlan}
          testID="fab-random-button"
        >
          <Shuffle size={20} color={Colors.light.primary} />
          <Text style={styles.actionButtonText}>Random</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.actionButton,
          {
            transform: [
              { scale: buttonScale },
              { translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -180],
              }) },
            ],
            opacity: buttonOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButtonInner}
          onPress={handleMap}
          testID="fab-map-button"
        >
          <MapPin size={20} color={Colors.light.primary} />
          <Text style={styles.actionButtonText}>Mapa</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main FAB Button */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={toggleExpanded}
        testID="main-fab-button"
      >
        <Animated.View
          style={{
            transform: [{ rotate: mainButtonRotation }],
          }}
        >
          {isExpanded ? (
            <X size={24} color={Colors.light.white} />
          ) : (
            <Plus size={24} color={Colors.light.white} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  actionButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 2,
    position: 'absolute',
    bottom: -16,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
});