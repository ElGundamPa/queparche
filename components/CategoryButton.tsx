import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Activity, Building, Landmark, Music, ShoppingBag, Ticket, Trees, Utensils } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { Category } from "@/types/plan";

interface CategoryButtonProps {
  category: Category;
  selected: boolean;
  onPress: () => void;
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

export default function CategoryButton({
  category,
  selected,
  onPress,
}: CategoryButtonProps) {
  const gradientColors = getCategoryGradient(category.name, selected);
  
  const renderIcon = () => {
    const color = selected ? Colors.light.white : Colors.light.text;
    const size = 24;

    switch (category.icon) {
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      testID={`category-button-${category.id}`}
    >
      <LinearGradient
        colors={gradientColors as [string, string]}
        style={styles.gradient}
      >
        {renderIcon()}
        <Text
          style={[
            styles.text,
            selected 
              ? { color: Colors.light.white }
              : { color: Colors.light.text }
          ]}
        >
          {category.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    width: 110,
    height: 110,
  },
  text: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});