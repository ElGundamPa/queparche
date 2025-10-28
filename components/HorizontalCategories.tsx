import React, { useCallback, useEffect, useRef } from 'react';
import { FlatList, Text, Pressable, Animated, Easing, Platform } from 'react-native';
import { Activity, Building, Landmark, Music, ShoppingBag, Ticket, Trees, Utensils } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { Category } from '@/types/plan';

interface HorizontalCategoriesProps {
  data: Category[];
  selectedCategory?: string | null;
  onCategoryPress?: (categoryName: string) => void;
}

const getCategoryGradient = (categoryName: string, selected: boolean) => {
  if (!selected) {
    return [Colors.light.card, Colors.light.lightGray];
  }
  
  // Todos los gradientes ahora usan variaciones de rojo suave
  switch (categoryName) {
    case "Restaurants":
      return ["#FF4444", "#FF6666"];
    case "Rooftops":
      return ["#CC3333", "#FF4444"];
    case "Free plans":
      return ["#FF4444", "#FF7777"];
    case "Culture":
      return ["#CC3333", "#FF6666"];
    case "Nature":
      return ["#FF4444", "#FF7777"];
    case "Nightlife":
      return ["#CC3333", "#FF4444"];
    case "Sports":
      return ["#FF4444", "#FF6666"];
    case "Shopping":
      return ["#CC3333", "#FF4444"];
    default:
      return [Colors.light.primary, '#FF4444'];
  }
};

function CategoryTile({ item, selected, onPress }: { 
  item: Category; 
  selected: boolean; 
  onPress: () => void; 
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeValue]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const renderIcon = () => {
    const color = selected ? Colors.light.white : Colors.light.text;
    const size = 24;

    switch (item.icon) {
      case "utensils":
        return <Utensils size={size} color={color} />;
      case "building":
        return <Building size={size} color={color} />;
      case "ticket":
        return <Ticket size={size} color={color} />;
      case "landmark":
        return <Landmark size={size} color={color} />;
      case "tree":
        return <Trees size={size} color={color} />;
      case "music":
        return <Music size={size} color={color} />;
      case "activity":
        return <Activity size={size} color={color} />;
      case "shopping-bag":
        return <ShoppingBag size={size} color={color} />;
      default:
        return <Activity size={size} color={color} />;
    }
  };

  const gradientColors = getCategoryGradient(item.name, selected) as [string, string];

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        opacity: fadeValue,
        marginRight: 16,
      }}
    >
      <Pressable
        onPress={handlePress}
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: Colors.light.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: selected ? 0.25 : 0.1,
          shadowRadius: selected ? 8 : 4,
          elevation: selected ? 6 : 3,
        }}
        testID={`category-tile-${item.id}`}
      >
        <LinearGradient
          colors={gradientColors}
          style={{
            width: 120,
            height: 110,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          {renderIcon()}
          <Text
            style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: '600',
              textAlign: 'center',
              color: selected ? Colors.light.white : Colors.light.text,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function HorizontalCategories({ 
  data, 
  selectedCategory, 
  onCategoryPress 
}: HorizontalCategoriesProps) {
  const renderItem = useCallback(({ item, index }: { item: Category; index: number }) => (
    <CategoryTile
      item={item}
      selected={selectedCategory === item.name}
      onPress={() => onCategoryPress?.(item.name)}
    />
  ), [selectedCategory, onCategoryPress]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 0,
      }}
      renderItem={renderItem}
      snapToAlignment="start"
      decelerationRate="fast"
      testID="horizontal-categories"
    />
  );
}