import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, Platform, StyleSheet, ViewStyle, View } from 'react-native';

interface HorizontalCardsProps<ItemT> {
  data: ItemT[];
  renderItem: ListRenderItem<ItemT>;
  keyExtractor: (item: ItemT, index: number) => string;
  itemWidth: number;
  gap?: number;
  contentPaddingHorizontal?: number;
  enableSnap?: boolean;
  testID?: string;
  contentStyle?: ViewStyle;
}

function getSnapInterval(itemWidth: number, gap: number) {
  return itemWidth + gap;
}

function HorizontalCardsComponent<ItemT>({
  data,
  renderItem,
  keyExtractor,
  itemWidth,
  gap = 16,
  contentPaddingHorizontal = 20,
  enableSnap = false,
  testID,
  contentStyle,
}: HorizontalCardsProps<ItemT>) {
  const getItemLayout = useCallback(
    (_: ArrayLike<ItemT> | null | undefined, index: number) => ({
      length: itemWidth + gap,
      offset: (itemWidth + gap) * index,
      index,
    }),
    [itemWidth, gap],
  );

  const contentContainerStyle = useMemo(() => [{ paddingHorizontal: contentPaddingHorizontal, gap }, contentStyle] as const, [contentPaddingHorizontal, gap, contentStyle]);

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      showsHorizontalScrollIndicator={Platform.OS === 'web' ? false : false}
      contentContainerStyle={contentContainerStyle as any}
      ItemSeparatorComponent={() => <View style={{ width: gap }} />}
      snapToAlignment={enableSnap ? 'start' : undefined}
      snapToInterval={enableSnap ? getSnapInterval(itemWidth, gap) : undefined}
      decelerationRate={enableSnap ? 'fast' : undefined}
      testID={testID}
    />
  );
}

const HorizontalCards = memo(HorizontalCardsComponent) as typeof HorizontalCardsComponent;
export default HorizontalCards;

const styles = StyleSheet.create({});