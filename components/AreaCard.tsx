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

function AreaCardBase({ title, image, onPress, testID }: Props) {
  const [failed, setFailed] = useState<boolean>(false);
  const onError = useCallback(() => {
    setFailed(true);
    console.log('AreaCard image failed, using placeholder', { title });
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
      <View style={styles.mediaWrap}>
        <Image
          source={src}
          onError={onError}
          contentFit="cover"
          style={styles.media}
          transition={150}
          cachePolicy="memory-disk"
        />
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
  mediaWrap: { width: '100%', height: 120 },
  media: { width: '100%', height: '100%' },
  meta: { padding: 8 },
  title: { fontSize: 16, fontWeight: '600' as const, color: '#FFFFFF' } as const,
});