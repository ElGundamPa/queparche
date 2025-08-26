import React, { memo, useCallback, useState } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { PLACEHOLDER_IMAGE } from '@/constants/images';

interface Props {
  title: string;
  image?: ImageSource;
  onPress?: () => void;
  testID?: string;
}

function ZoneCardBase({ title, image, onPress, testID }: Props) {
  const [failed, setFailed] = useState<boolean>(false);
  const onError = useCallback(() => {
    setFailed(true);
    console.log('ZoneCard image failed, using placeholder', { title });
  }, [title]);

  const src: ImageSource = failed ? PLACEHOLDER_IMAGE : (image ?? PLACEHOLDER_IMAGE);

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${title}`}
      style={styles.card}
    >
      <Image
        source={src}
        onError={onError}
        contentFit="cover"
        style={styles.image}
        transition={150}
        cachePolicy="memory-disk"
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
}

export default memo(ZoneCardBase);

const styles = StyleSheet.create({
  card: {
    width: 156,
    height: 156,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'flex-end', padding: 8 } as const,
  title: { color: '#ffffff', fontWeight: '600' as const, fontSize: 16 } as const,
});