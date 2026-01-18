import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Clock,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  ArrowLeft,
  Check,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockEvents } from '@/mocks/events';
import theme from '@/lib/theme';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useEventsStore } from '@/store/eventsStore';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [instagramExpanded, setInstagramExpanded] = useState(false);

  // Use events store
  const {
    joinEvent,
    leaveEvent,
    getEventAttendees,
    hasUserJoined,
    getAttendeesCount,
  } = useEventsStore();

  // Instagram accounts for this event
  const instagramAccounts = [
    { id: '1', username: '@808festoficial', name: '808 Fest Oficial', followers: '712' },
    { id: '2', username: '@asado.mistico', name: 'Asado Místico', followers: '206' },
    { id: '3', username: '@enmed202', name: 'En Medellín 2025', followers: '1.286' },
    { id: '4', username: '@queparche_app', name: 'QuéParche App', followers: '94' },
  ];

  const event = useMemo(() => {
    return mockEvents.find(e => e.id === id);
  }, [id]);

  // Get attendees from store
  const attendees = getEventAttendees(id as string);
  const hasJoined = currentUser ? hasUserJoined(id as string, currentUser.id) : false;
  const attendeesCount = getAttendeesCount(id as string);

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Evento no encontrado</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Entrada Gratis';
    return `$${price.toLocaleString('es-CO')}`;
  };

  const handleSocialLink = async (url: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Implement share functionality
  };

  const handleInstagramToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInstagramExpanded(!instagramExpanded);
  };

  const handleInstagramAccount = async (username: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = `https://instagram.com/${username.replace('@', '')}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening Instagram:', error);
    }
  };

  const handleJoinParche = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!currentUser) return;

    if (hasJoined) {
      // Leave parche
      leaveEvent(id as string, currentUser.id);
    } else {
      // Join parche
      const newAttendee = {
        id: currentUser.id,
        name: currentUser.name || currentUser.username || 'Usuario',
        username: currentUser.username,
        avatar: currentUser.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        joinedAt: new Date().toISOString(),
      };
      joinEvent(id as string, newAttendee);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <ImageBackground
          source={{ uri: event.image }}
          style={styles.headerImage}
          imageStyle={styles.headerImageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)', '#0B0B0B']}
            style={styles.headerGradient}
          >
            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerButton}
              >
                <Share2 size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Event Badge */}
            {event.isFeatured && (
              <View style={styles.badgeContainer}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Text style={styles.badgeText}>⭐ EVENTO PRINCIPAL</Text>
                </LinearGradient>
              </View>
            )}

            {/* Event Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.category}>{event.category}</Text>
              <Text style={styles.title}>{event.title}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Info Cards */}
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <Calendar size={20} color={theme.colors.primary} />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardLabel}>Fecha</Text>
                <Text style={styles.infoCardValue}>
                  {formatDate(event.startDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Clock size={20} color={theme.colors.primary} />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardLabel}>Hora</Text>
                <Text style={styles.infoCardValue}>
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <MapPin size={20} color={theme.colors.primary} />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardLabel}>Lugar</Text>
                <Text style={styles.infoCardValue} numberOfLines={2}>
                  {event.location.address}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ticket size={20} color={theme.colors.primary} />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardLabel}>Entrada</Text>
                <Text style={[
                  styles.infoCardValue,
                  (!event.price || event.price === 0) && styles.freePrice
                ]}>
                  {formatPrice(event.price)}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Users size={20} color={theme.colors.primary} />
              <View style={styles.infoCardText}>
                <Text style={styles.infoCardLabel}>Asistentes</Text>
                <Text style={styles.infoCardValue}>
                  {event.currentAttendees}/{event.maxAttendees || '∞'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre el evento</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Organizer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizado por</Text>
            <View style={styles.organizerCard}>
              <View style={styles.organizerIcon}>
                <Text style={styles.organizerIconText}>
                  {event.organizerName.charAt(0)}
                </Text>
              </View>
              <Text style={styles.organizerName}>{event.organizerName}</Text>
            </View>
          </View>

          {/* Social Links */}
          {event.socialLinks && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Redes sociales</Text>
              <View style={styles.socialLinks}>
                {event.socialLinks.instagram && (
                  <View>
                    <TouchableOpacity
                      onPress={handleInstagramToggle}
                      style={styles.socialButton}
                    >
                      <View style={styles.socialButtonLeft}>
                        <View style={styles.mainInstagramIconContainer}>
                          <Instagram size={22} color="#E4405F" fill="#E4405F" />
                        </View>
                        <Text style={styles.socialButtonText}>Instagram</Text>
                      </View>
                      {instagramExpanded ? (
                        <ChevronUp size={20} color="#999999" />
                      ) : (
                        <ChevronDown size={20} color="#999999" />
                      )}
                    </TouchableOpacity>

                    {instagramExpanded && (
                      <View style={styles.instagramAccountsList}>
                        {instagramAccounts.map((account, index) => (
                          <Animated.View
                            key={account.id}
                            entering={FadeInDown.delay(index * 80).duration(300)}
                          >
                            <TouchableOpacity
                              onPress={() => handleInstagramAccount(account.username)}
                              style={styles.instagramAccountItem}
                              activeOpacity={0.7}
                            >
                              <View style={styles.instagramIconContainer}>
                                <Instagram size={20} color="#E4405F" />
                              </View>
                              <View style={styles.instagramAccountInfo}>
                                <Text style={styles.instagramUsername}>{account.username}</Text>
                                <Text style={styles.instagramName}>{account.name}</Text>
                              </View>
                              <View style={styles.followersContainer}>
                                <Text style={styles.followersCount}>{account.followers}</Text>
                                <Text style={styles.followersLabel}>seguidores</Text>
                              </View>
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
                {event.socialLinks.facebook && (
                  <TouchableOpacity
                    onPress={() => handleSocialLink(event.socialLinks!.facebook!)}
                    style={styles.socialButton}
                  >
                    <View style={styles.socialButtonLeft}>
                      <Facebook size={24} color="#1877F2" fill="#1877F2" />
                      <Text style={styles.socialButtonText}>Facebook</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {event.socialLinks.twitter && (
                  <TouchableOpacity
                    onPress={() => handleSocialLink(event.socialLinks!.twitter!)}
                    style={styles.socialButton}
                  >
                    <View style={styles.socialButtonLeft}>
                      <Twitter size={24} color="#1DA1F2" fill="#1DA1F2" />
                      <Text style={styles.socialButtonText}>Twitter</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {event.socialLinks.website && (
                  <TouchableOpacity
                    onPress={() => handleSocialLink(event.socialLinks!.website!)}
                    style={styles.socialButton}
                  >
                    <View style={styles.socialButtonLeft}>
                      <Globe size={24} color={theme.colors.primary} />
                      <Text style={styles.socialButtonText}>Sitio web</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Attendees Section */}
          <View style={styles.section}>
            <View style={styles.attendeesHeader}>
              <Text style={styles.sectionTitle}>Parceros unidos</Text>
              <View style={styles.attendeesCount}>
                <Users size={16} color={theme.colors.primary} />
                <Text style={styles.attendeesCountText}>
                  {attendees.length} {attendees.length === 1 ? 'persona' : 'personas'}
                </Text>
              </View>
            </View>
            <View style={styles.attendeesList}>
              {attendees.map((attendee, index) => (
                <Animated.View
                  key={attendee.id}
                  entering={FadeInDown.delay(index * 50).duration(300)}
                  style={styles.attendeeItem}
                >
                  <Image
                    source={{ uri: attendee.avatar }}
                    style={styles.attendeeAvatar}
                  />
                  <View style={styles.attendeeInfo}>
                    <View style={styles.attendeeNameRow}>
                      <Text style={styles.attendeeName}>{attendee.name}</Text>
                      {attendee.id === currentUser?.id && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>Tú</Text>
                        </View>
                      )}
                    </View>
                    {attendee.username && (
                      <Text style={styles.attendeeUsername}>@{attendee.username}</Text>
                    )}
                  </View>
                  {attendee.id === currentUser?.id && (
                    <View style={styles.joinedBadge}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Bottom CTA */}
        <LinearGradient
          colors={['#0B0B0B', '#1A1A1A']}
          style={styles.bottomBar}
        >
          <View style={styles.bottomBarContent}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>
                {(!event.price || event.price === 0) ? 'Entrada' : 'Precio'}
              </Text>
              <View style={styles.priceRow}>
                <Text style={[
                  styles.priceValue,
                  (!event.price || event.price === 0) && styles.freePriceValue
                ]}>
                  {formatPrice(event.price)}
                </Text>
                {(!event.price || event.price === 0) && (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>GRATIS</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={handleJoinParche}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={hasJoined
                  ? ['#2ECC71', '#27AE60']
                  : [theme.colors.primary, theme.colors.secondary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <View style={styles.ctaButtonInner}>
                  {hasJoined ? (
                    <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                  ) : (
                    <UserPlus size={16} color="#FFFFFF" strokeWidth={2.5} />
                  )}
                  <Text style={styles.ctaButtonText}>
                    {hasJoined ? 'Unido' : 'Unirse'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  headerImage: {
    width: '100%',
    height: 380,
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleContainer: {
    marginTop: 'auto',
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  quickInfo: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  freePrice: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  tagText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  organizerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialLinks: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  socialButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mainInstagramIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(228, 64, 95, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(228, 64, 95, 0.3)',
  },
  instagramAccountsList: {
    marginTop: 12,
    gap: 8,
    paddingLeft: 8,
  },
  instagramAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(228, 64, 95, 0.1)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(228, 64, 95, 0.2)',
  },
  instagramIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(228, 64, 95, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instagramAccountInfo: {
    flex: 1,
  },
  instagramUsername: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  instagramName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
  },
  followersContainer: {
    alignItems: 'flex-end',
  },
  followersCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E4405F',
  },
  followersLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomBar: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  freePriceValue: {
    color: theme.colors.primary,
  },
  freeBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...theme.shadows.button,
  },
  ctaButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  attendeesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  attendeesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  attendeesCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  attendeesList: {
    gap: 12,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  attendeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333333',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  attendeeUsername: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999999',
  },
  youBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  joinedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
