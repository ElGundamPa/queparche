import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

export type FilterChip = { id: string; label: string };

export type FiltersBarProps = {
  chips: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
};

const Chip = memo(function Chip({ chip, onRemove }: { chip: FilterChip; onRemove: (id: string) => void }) {
  return (
    <View style={styles.chip} testID={`chip-${chip.id}`}>
      <Text numberOfLines={1} style={styles.chipText}>{chip.label}</Text>
      <Pressable accessibilityLabel={`Quitar ${chip.label}`} onPress={() => onRemove(chip.id)} hitSlop={8} style={styles.chipRemove}>
        <X size={14} color={Colors.light.text} />
      </Pressable>
    </View>
  );
});

export default function FiltersBar({ chips, onRemove, onClearAll }: FiltersBarProps) {
  const keyExtractor = useCallback((item: FilterChip) => item.id, []);
  const renderItem = useCallback(({ item }: { item: FilterChip }) => (
    <Chip chip={item} onRemove={onRemove} />
  ), [onRemove]);

  if (!chips.length) return null;

  return (
    <View style={styles.wrapper} testID="filters-bar">
      <FlatList
        data={chips}
        keyExtractor={keyExtractor}
        horizontal
        contentContainerStyle={styles.listContent}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
      {onClearAll ? (
        <Pressable accessibilityLabel="Limpiar todo" onPress={onClearAll} style={styles.clearButton} testID="clear-filters">
          <Text style={styles.clearText}>Limpiar todo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    paddingRight: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
    maxWidth: 220,
  },
  chipText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
  chipRemove: {
    marginLeft: 6,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
