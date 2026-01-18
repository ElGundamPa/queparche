import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Gift, X, Share2, Copy } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import theme from '@/lib/theme';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface PromoCardProps {
  promoCode: string;
  userName?: string;
}

export default function PromoCard({ promoCode, userName }: PromoCardProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const scaleValue = useSharedValue(1);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15 });
  };

  const handleOpenQR = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowQRModal(true);
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(promoCode);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Usa mi código ${promoCode} y obtén 10% de descuento en consumibles en 808 Fest x Asado Mistico! 🎉`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <>
      <Animated.View entering={FadeInDown.delay(500).duration(600)}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleOpenQR}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={animatedStyle}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53', '#FFD166']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Decoración */}
              <View style={styles.decoration}>
                <View style={[styles.circle, { top: -20, right: -20 }]} />
                <View style={[styles.circle, { bottom: -30, left: -30, opacity: 0.3 }]} />
              </View>

              <View style={styles.contentWrapper}>
                <View style={styles.headerRow}>
                  <View style={styles.iconContainer}>
                    <Gift size={28} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.title}>Tu código promocional</Text>
                    <Text style={styles.eventName}>808 Fest x Asado Mistico</Text>
                  </View>
                </View>

                <View style={styles.codeRow}>
                  <View style={styles.codeContainer}>
                    <Text style={styles.code}>{promoCode}</Text>
                    <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                      <Copy size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.discount}>10% de descuento en consumibles</Text>
                </View>

                <TouchableOpacity onPress={handleOpenQR} style={styles.qrButton}>
                  <View style={styles.qrButtonContent}>
                    <Text style={styles.qrButtonText}>Ver QR Code</Text>
                    <View style={styles.qrIconWrapper}>
                      <View style={styles.qrIconSquare} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal QR */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={ZoomIn.duration(300)} style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}
            >
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>

            <Animated.View entering={FadeIn.delay(200)}>
              <Text style={styles.modalTitle}>Tu código promocional</Text>
              <Text style={styles.modalEventName}>808 Fest x Asado Mistico</Text>
            </Animated.View>

            <Animated.View entering={ZoomIn.delay(300).duration(400)} style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={JSON.stringify({
                    code: promoCode,
                    event: '808 Fest x Asado Mistico',
                    discount: '10%',
                    type: 'consumibles',
                    userName: userName || 'Usuario',
                  })}
                  size={width * 0.6}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.codeInfoContainer}>
              <Text style={styles.modalCode}>{promoCode}</Text>
              <Text style={styles.modalDiscount}>10% de descuento en consumibles</Text>
              <Text style={styles.modalInstructions}>
                Presenta este QR en el evento para aplicar tu descuento
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500)} style={styles.modalButtons}>
              <TouchableOpacity onPress={handleCopyCode} style={styles.modalButton}>
                <Copy size={20} color={theme.colors.primary} />
                <Text style={styles.modalButtonText}>Copiar código</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={[styles.modalButton, styles.shareButton]}
              >
                <Share2 size={20} color="#FFFFFF" />
                <Text style={[styles.modalButtonText, styles.shareButtonText]}>
                  Compartir
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  decoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentWrapper: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  codeRow: {
    gap: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  code: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  copyButton: {
    padding: 4,
  },
  discount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.95,
    marginTop: 4,
  },
  qrButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    ...theme.shadows.button,
  },
  qrButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  qrButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  qrIconWrapper: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconSquare: {
    width: 12,
    height: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 32,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  modalEventName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    marginVertical: 20,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    ...theme.shadows.card,
  },
  codeInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  modalCode: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: 2,
    marginBottom: 8,
  },
  modalDiscount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  modalInstructions: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.light.lightGray,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  shareButtonText: {
    color: '#FFFFFF',
  },
});
