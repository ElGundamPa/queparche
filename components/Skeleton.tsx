import React from 'react';
import { View } from 'react-native';

export default function SkeletonCard({ width=280 }:{ width?: number }) {
  return (
    <View style={{ width }} className="bg-bg-card rounded-2xl overflow-hidden">
      <View className="w-full" style={{ height: 160 }}>
        <View className="w-full h-full bg-bg-soft" />
      </View>
      <View className="p-4">
        <View className="w-20 h-5 bg-bg-soft rounded mb-2" />
        <View className="w-full h-4 bg-bg-soft rounded mb-2" />
        <View className="w-2/3 h-4 bg-bg-soft rounded" />
      </View>
    </View>
  );
}
