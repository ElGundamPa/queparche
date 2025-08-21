import React, { memo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface Props {
  title: string;
  image: any;
  onPress?: () => void;
  testID?: string;
}

function AreaCardBase({ title, image, onPress, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${title}`}
      style={styles.card}
    >
      <View style={styles.mediaWrap}>
        <Image source={image} contentFit="cover" style={styles.media} transition={150} cachePolicy="memory-disk" />
      </View>
      <View style={styles.meta}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
}

export default memo(AreaCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  mediaWrap: { width: '100%', height: 112 },
  media: { width: '100%', height: '100%' },
  meta: { padding: 8 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
});