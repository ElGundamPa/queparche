import React, { useState, useRef } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity, Text, FlatList, Animated } from "react-native";
import { Search, Filter, X, Clock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { useSearchStore } from "@/hooks/use-search-store";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showFilter?: boolean;
  onFilterPress?: () => void;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar",
  showFilter = false,
  onFilterPress,
  showSuggestions = false,
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { searchHistory, searchSuggestions, clearSearchHistory } = useSearchStore();
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      Animated.timing(animatedHeight, {
        toValue: 200,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      if (showSuggestions) {
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }, 150);
  };

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    inputRef.current?.blur();
  };

  const handleClearSearch = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  const suggestions = value.trim() ? searchSuggestions : searchHistory;
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          isFocused ? Colors.light.primary + '20' : Colors.light.card,
          isFocused ? Colors.light.primary + '10' : Colors.light.lightGray
        ]}
        style={[
          styles.gradient,
          isFocused && styles.gradientFocused
        ]}
      >
        <Search size={20} color={isFocused ? Colors.light.primary : Colors.light.darkGray} style={styles.icon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.darkGray}
          autoFocus={autoFocus}
          returnKeyType="search"
          testID="search-input"
        />
        
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <X size={18} color={Colors.light.darkGray} />
          </TouchableOpacity>
        )}
        
        {showFilter && (
          <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
            <Filter size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        )}
      </LinearGradient>
      
      {showSuggestions && (
        <Animated.View style={[styles.suggestionsContainer, { height: animatedHeight }]}>
          {suggestions.length > 0 && (
            <>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsTitle}>
                  {value.trim() ? 'Sugerencias' : 'Búsquedas recientes'}
                </Text>
                {!value.trim() && searchHistory.length > 0 && (
                  <TouchableOpacity onPress={clearSearchHistory}>
                    <Text style={styles.clearHistoryText}>Limpiar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <FlatList
                data={suggestions.slice(0, 5)}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(item)}
                  >
                    {value.trim() ? (
                      <Search size={16} color={Colors.light.darkGray} />
                    ) : (
                      <Clock size={16} color={Colors.light.darkGray} />
                    )}
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </Animated.View>
      )}
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gradientFocused: {
    borderColor: Colors.light.primary + '40',
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
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  clearHistoryText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
});