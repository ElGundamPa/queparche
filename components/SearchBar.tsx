import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity, Text, ScrollView, Animated, Platform } from "react-native";
import { Search, Filter, X, Clock, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';

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

  // Animaciones para efectos visuales
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ),
        Animated.spring(iconRotate, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      Animated.spring(animatedHeight, {
        toValue: 200,
        useNativeDriver: false,
        friction: 8,
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

  const iconSpin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Glow effect al enfocar */}
      {isFocused && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.light.primary + '40', Colors.light.secondary + '40', Colors.light.primary + '40']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glowGradient}
          />
        </Animated.View>
      )}

      <LinearGradient
        colors={
          isFocused
            ? ['rgba(26, 26, 26, 0.95)', 'rgba(38, 38, 38, 0.95)']
            : ['#1A1A1A', '#222222']
        }
        style={[styles.gradient, isFocused && styles.gradientFocused]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Icon con animación */}
        <Animated.View style={{ transform: [{ rotate: iconSpin }] }}>
          {isFocused ? (
            <Sparkles size={20} color={Colors.light.primary} style={styles.icon} />
          ) : (
            <Search size={20} color={Colors.light.darkGray} style={styles.icon} />
          )}
        </Animated.View>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          autoFocus={autoFocus}
          returnKeyType="search"
          testID="search-input"
          selectionColor={Colors.light.primary}
        />

        {value.length > 0 && (
          <Animated.View entering={undefined}>
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <View style={styles.clearButtonInner}>
                <X size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {showFilter && (
          <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.secondary]}
              style={styles.filterGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Filter size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {showSuggestions && isFocused && suggestions.length > 0 && (
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

              <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {suggestions.slice(0, 5).map((item, index) => (
                  <TouchableOpacity
                    key={`${item}-${index}`}
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
                ))}
              </ScrollView>
            </>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'visible',
  },
  glowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
    borderRadius: 28,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientFocused: {
    borderColor: Colors.light.primary,
    borderWidth: 1.5,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  clearButton: {
    marginLeft: 8,
  },
  clearButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    marginLeft: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  filterGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  clearHistoryText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  suggestionText: {
    fontSize: 15,
    color: '#CCCCCC',
    flex: 1,
    fontWeight: '500',
  },
});