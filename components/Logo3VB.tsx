import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface Logo3VBProps {
  size?: number;
  showText?: boolean;
}

export default function Logo3VB({ size = 60, showText = true }: Logo3VBProps) {
  const logoSize = size;
  const textSize = size * 0.15;
  
  return (
    <View style={styles.container}>
      {/* Logo circular */}
      <LinearGradient
        colors={['#9ca3af', '#6b7280', '#4b5563']}
        style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
      >
        <View style={styles.logoInner}>
          {/* Diseño tipo "S" o flechas entrelazadas */}
          <View style={styles.logoShape}>
            <View style={styles.logoCurve1} />
            <View style={styles.logoCurve2} />
            <View style={styles.logoCurve3} />
          </View>
        </View>
      </LinearGradient>
      
      {showText && (
        <Text style={[styles.logoText, { fontSize: textSize }]}>
          3VB — Abogados en ciberfraude
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoInner: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoShape: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  logoCurve1: {
    position: 'absolute',
    width: '60%',
    height: '8%',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    top: '20%',
    left: '20%',
    transform: [{ rotate: '45deg' }],
  },
  logoCurve2: {
    position: 'absolute',
    width: '60%',
    height: '8%',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    top: '40%',
    right: '20%',
    transform: [{ rotate: '-45deg' }],
  },
  logoCurve3: {
    position: 'absolute',
    width: '60%',
    height: '8%',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    bottom: '25%',
    left: '20%',
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    color: '#f3f4f6',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

