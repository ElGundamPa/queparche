import React, { memo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface Props {
  title: string;
  image: any;
  onPress?: () => void;
  testID?: string;
}

function ZoneCardBase({ title, image, onPress, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${title}`}
      style={styles.card}
    >
      <Image source={image} contentFit="cover" style={styles.image} transition={150} cachePolicy="memory-disk" />
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
}

export default memo(ZoneCardBase);

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', padding: 8 },
  title: { color: '#fff', fontWeight: '600', fontSize: 16 },
});