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
        colors={[Colors.light.primary, '#FF4444']}
        style={[styles.logoContainer, { width: logoSize, height: logoSize }]}
      >
        <View style={styles.logoInner}>
          {/* Logo de parche - círculo con "P" */}
          <Text style={[styles.logoText, { fontSize: logoSize * 0.4 }]}>P</Text>
        </View>
      </LinearGradient>
      
      {showText && (
        <Text style={[styles.brandText, { fontSize: textSize }]}>
          QueParche
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
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: Colors.light.white,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandText: {
    color: Colors.light.text,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
});

