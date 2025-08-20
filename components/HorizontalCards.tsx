import React, { memo, useCallback, useMemo } from 'react';
import { ListRenderItem, StyleSheet, ViewStyle, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

interface HorizontalCardsProps<ItemT> {
  data: ItemT[];
  renderItem: ListRenderItem<ItemT>;
  keyExtractor: (item: ItemT, index: number) => string;
  itemWidth: number;
  gap?: number;
  contentPaddingHorizontal?: number;
  testID?: string;
  contentStyle?: ViewStyle;
  estimatedItemSize?: number;
}

function HorizontalCardsComponent<ItemT>({
  data,
  renderItem,
  keyExtractor,
  itemWidth,
  gap = 16,
  contentPaddingHorizontal = 20,
  testID,
  contentStyle,
  estimatedItemSize = 280,
}: HorizontalCardsProps<ItemT>) {
  const contentContainerStyle = useMemo(() => [{ paddingHorizontal: contentPaddingHorizontal }, contentStyle] as const, [contentPaddingHorizontal, contentStyle]);

  const wrappedRenderItem = useCallback<NonNullable<typeof renderItem>>(
    (args) => (
      <View style={{ width: itemWidth }}>
        {renderItem(args)}
      </View>
    ),
    [renderItem, itemWidth],
  );

  return (
    <FlashList
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={false}
      decelerationRate="normal"
      data={data}
      renderItem={wrappedRenderItem as any}
      keyExtractor={keyExtractor as any}
      contentContainerStyle={contentContainerStyle as any}
      ItemSeparatorComponent={() => <View style={{ width: gap }} />}
      testID={testID}
      estimatedItemSize={estimatedItemSize}
      removeClippedSubviews
    />
  );
}

const HorizontalCards = memo(HorizontalCardsComponent) as typeof HorizontalCardsComponent;
export default HorizontalCards;

const styles = StyleSheet.create({});