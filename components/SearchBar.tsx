import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Search, Filter } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar",
  showFilter = false,
  onFilterPress,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.card, Colors.light.lightGray]}
        style={styles.gradient}
      >
        <Search size={20} color={Colors.light.darkGray} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.darkGray}
          testID="search-input"
        />
        {showFilter && (
          <Filter 
            size={20} 
            color={Colors.light.primary} 
            style={styles.filterIcon}
            onPress={onFilterPress}
          />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  filterIcon: {
    marginLeft: 12,
  },
});