import 'react-native-get-random-values';
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Send, Bot, User, Sparkles, Heart, Users, MapPin, Star, Zap, ChevronLeft } from "lucide-react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from "expo-haptics";
import { v4 as uuidv4 } from 'uuid';
import Toast from "react-native-toast-message";

import Colors from "@/constants/colors";
import theme from "@/lib/theme";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { Plan } from "@/types/plan";

const { width } = Dimensions.get('window');

interface PlanReference {
  planId: string;
  matchName: string;
  confidence: number;
}

interface AIResponse {
  content: string;
  planReferences?: PlanReference[];
  typingDelay?: number;
  confidenceScore?: number;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  planReferences?: PlanReference[];
  aiResponse?: AIResponse;
}

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  index: number;
}

const QuickAction = ({ label, icon, onPress, index }: QuickActionProps) => (
  <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(255, 68, 68, 0.1)', 'rgba(255, 68, 68, 0.05)']}
        style={styles.quickActionGradient}
      >
        <View style={styles.quickActionIcon}>{icon}</View>
        <Text style={styles.quickActionText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withTiming(1, { duration: 600 }),
      -1,
      true
    );
    dot2.value = withRepeat(
      withTiming(1, { duration: 600 }),
      -1,
      true
    );
    dot3.value = withRepeat(
      withTiming(1, { duration: 600 }),
      -1,
      true
    );
  }, []);

  const animatedDot1 = useAnimatedStyle(() => ({
    opacity: 0.3 + dot1.value * 0.7,
    transform: [{ translateY: -dot1.value * 4 }],
  }));

  const animatedDot2 = useAnimatedStyle(() => ({
    opacity: 0.3 + dot2.value * 0.7,
    transform: [{ translateY: -dot2.value * 4 }],
  }));

  const animatedDot3 = useAnimatedStyle(() => ({
    opacity: 0.3 + dot3.value * 0.7,
    transform: [{ translateY: -dot3.value * 4 }],
  }));

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, animatedDot1]} />
        <Animated.View style={[styles.typingDot, animatedDot2]} />
        <Animated.View style={[styles.typingDot, animatedDot3]} />
      </View>
      <Text style={styles.typingText}>Parche AI está escribiendo...</Text>
    </View>
  );
};

export default function AIAssistantImproved() {
  const router = useRouter();
  const { plans } = usePlansStore();
  const { user } = useUserStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `¡Hola ${user?.name?.split(' ')[0] || 'amigo'}! 👋\n\nSoy Parche AI, tu asistente inteligente para descubrir los mejores planes en Medellín.\n\nPuedo ayudarte a encontrar planes románticos, de rumba, comida, naturaleza, deportes, culturales y mucho más.\n\n¿Qué tipo de plan te gustaría hacer hoy?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isFirstUserMessage, setIsFirstUserMessage] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const quickCategories = [
    { label: '❤️ Romántico', icon: <Heart size={20} color="#FF4444" fill="#FF4444" />, query: 'Quiero un plan romántico para mi pareja' },
    { label: '🎉 Rumba', icon: <Zap size={20} color="#FF4444" fill="#FF4444" />, query: 'Quiero salir a rumbear esta noche' },
    { label: '🍕 Comida', icon: <Star size={20} color="#FF4444" fill="#FF4444" />, query: 'Quiero ir a comer algo delicioso' },
    { label: '🌳 Naturaleza', icon: <MapPin size={20} color="#FF4444" />, query: 'Quiero un plan al aire libre' },
  ];

  const messagesLengthRef = useRef(messages.length);

  useEffect(() => {
    // Solo hacer scroll si se agregó un nuevo mensaje
    if (messages.length > messagesLengthRef.current) {
      messagesLengthRef.current = messages.length;
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleQuickAction = (query: string) => {
    setShowQuickActions(false);
    setInputText(query);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const generateMockResponse = useCallback((userMessage: string, isFirstMessage: boolean = false): AIResponse => {
    const messageLower = userMessage.toLowerCase();

    let relevantPlans = plans;
    let intro = "";
    let category = "";

    // Detectar intención del usuario
    if (messageLower.includes('romántico') || messageLower.includes('pareja') || messageLower.includes('cita') || messageLower.includes('amor')) {
      relevantPlans = plans.filter(p => p.rating && p.rating >= 4.5).slice(0, 3);
      category = "romántico";
      intro = "¡Claro! Para algo romántico, encontré estos lugares perfectos para ti:";
    } else if (messageLower.includes('rumba') || messageLower.includes('fiesta') || messageLower.includes('noche') || messageLower.includes('bailar')) {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes('nocturno') || p.category?.toLowerCase().includes('bar')).slice(0, 3);
      category = "rumba";
      intro = "¡Dale! Para la rumba, estos planes están brutales:";
    } else if (messageLower.includes('comida') || messageLower.includes('comer') || messageLower.includes('restaurante') || messageLower.includes('almuerzo') || messageLower.includes('cena')) {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes('comida') || p.category?.toLowerCase().includes('restaurante')).slice(0, 3);
      category = "comida";
      intro = "¡Qué rico! Para comer delicioso, te recomiendo:";
    } else if (messageLower.includes('naturaleza') || messageLower.includes('parque') || messageLower.includes('aire libre') || messageLower.includes('senderismo') || messageLower.includes('caminar')) {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes('parque') || p.category?.toLowerCase().includes('naturaleza')).slice(0, 3);
      category = "naturaleza";
      intro = "¡Perfecto! Para disfrutar la naturaleza, te sugiero:";
    } else if (messageLower.includes('deporte') || messageLower.includes('ejercicio') || messageLower.includes('gym') || messageLower.includes('actividad física')) {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes('deporte')).slice(0, 3);
      category = "deportivo";
      intro = "¡Bacano! Para mantenerte activo, estos planes son ideales:";
    } else if (messageLower.includes('cultura') || messageLower.includes('museo') || messageLower.includes('arte') || messageLower.includes('teatro')) {
      relevantPlans = plans.filter(p => p.category?.toLowerCase().includes('cultura') || p.category?.toLowerCase().includes('arte')).slice(0, 3);
      category = "cultural";
      intro = "¡Excelente! Para un plan cultural, te recomiendo:";
    } else if (messageLower.includes('gratis') || messageLower.includes('económico') || messageLower.includes('barato')) {
      relevantPlans = plans.filter(p => !p.price || p.price === 0).slice(0, 3);
      category = "económico";
      intro = "¡Claro! Aquí tienes planes económicos que te van a encantar:";
    } else if (messageLower.includes('amigos') || messageLower.includes('grupo') || messageLower.includes('varios')) {
      relevantPlans = plans.filter(p => p.maxAttendees && p.maxAttendees > 5).slice(0, 3);
      category = "grupal";
      intro = "¡Chevere! Para ir con amigos, estos planes son perfectos:";
    } else {
      // Respuesta genérica para cualquier otra pregunta
      relevantPlans = plans.slice(0, 3);
      category = "general";
      intro = "Entiendo lo que buscas. Aquí te muestro algunos planes que podrían interesarte:";
    }

    // Si no encontró planes relevantes, usar los mejores valorados
    if (relevantPlans.length === 0) {
      relevantPlans = plans.filter(p => p.rating && p.rating >= 4.0).slice(0, 3);
      intro = "Aunque estoy aprendiendo a entender mejor tu solicitud, te puedo mostrar estos planes populares:";
    }

    // Construir respuesta
    let response = "";

    // Mostrar disclaimer solo en el primer mensaje
    if (isFirstMessage) {
      response = "¡Gracias por confiar en mí! 😊\n\n";
      response += "🚧 **Parche AI está en desarrollo**\n\n";
      response += "Aunque todavía estoy aprendiendo, haré mi mejor esfuerzo para ayudarte a encontrar el plan perfecto. Pronto tendré muchas más capacidades.\n\n";
      response += "---\n\n";
    }

    response += intro + "\n\n";

    if (relevantPlans.length > 0) {
      relevantPlans.forEach((plan) => {
        response += `**${plan.name}**\n`;
        response += `${plan.category || 'Plan'} - ${plan.description?.substring(0, 60)}...\n`;
        if (plan.rating) response += `⭐ ${plan.rating.toFixed(1)}/5`;
        if (plan.likes) response += ` • ❤️ ${plan.likes} likes`;
        response += `\n\n`;
      });

      response += "💡 *Toca cualquier plan para ver más detalles*\n\n";
      response += "¿Te gustaría saber más sobre alguno de estos planes?";
    } else {
      response += "Por ahora no encontré planes que coincidan exactamente con tu búsqueda, pero pronto tendré mejores capacidades de búsqueda.\n\n";
      response += "Mientras tanto, puedes explorar todos los planes disponibles en la pestaña de Inicio o usar el Mapa para encontrar planes cerca de ti. 😊";
    }

    return {
      content: response,
      planReferences: relevantPlans.map(p => ({
        planId: p.id,
        matchName: p.name,
        confidence: relevantPlans.length > 0 ? 0.75 : 0.5
      })),
      typingDelay: 1200, // Más tiempo para parecer más "inteligente"
      confidenceScore: relevantPlans.length > 0 ? 0.75 : 0.5
    };
  }, [plans]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setShowQuickActions(false);

    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }

    try {
      const aiResponse = generateMockResponse(userMessage.content, isFirstUserMessage);

      if (aiResponse.typingDelay) {
        await new Promise(resolve => setTimeout(resolve, aiResponse.typingDelay));
      }

      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponse.content,
        isUser: false,
        timestamp: new Date(),
        planReferences: aiResponse.planReferences,
        aiResponse
      };

      setMessages(prev => [...prev, aiMessage]);

      // Marcar que ya no es el primer mensaje
      if (isFirstUserMessage) {
        setIsFirstUserMessage(false);
      }
    } catch (error) {
      console.error('Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No pude procesar tu mensaje',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, generateMockResponse]);

  const PlanCard = ({ plan }: { plan: Plan }) => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push(`/plan/${plan.id}`);
        }}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: plan.images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
          style={styles.planImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.planGradient}
        >
          <View style={styles.planInfo}>
            <Text style={styles.planName} numberOfLines={1}>{plan.name}</Text>
            <Text style={styles.planCategory}>{plan.category}</Text>
            <View style={styles.planStats}>
              {plan.rating && (
                <View style={styles.planStat}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.planStatText}>{plan.rating.toFixed(1)}</Text>
                </View>
              )}
              <View style={styles.planStat}>
                <Heart size={12} color="#FF4444" />
                <Text style={styles.planStatText}>{plan.likes}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const referencedPlans = item.planReferences
      ?.map(ref => plans.find(p => p.id === ref.planId))
      .filter(Boolean) as Plan[] || [];

    return (
      <Animated.View
        entering={SlideInRight.delay(index * 50).duration(300)}
        style={[
          styles.messageWrapper,
          item.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
        ]}
      >
        {!item.isUser && (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.botAvatar}
          >
            <Bot size={16} color="#FFFFFF" />
          </LinearGradient>
        )}

        <View style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.aiBubble
        ]}>
          {!item.isUser && (
            <Text style={styles.messageSender}>Parche AI</Text>
          )}
          <Text style={[
            styles.messageText,
            item.isUser && styles.userMessageText
          ]}>
            {item.content}
          </Text>

          {referencedPlans.length > 0 && (
            <View style={styles.plansContainer}>
              <Text style={styles.plansTitle}>Planes recomendados:</Text>
              {referencedPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </View>
          )}

          <Text style={[
            styles.messageTime,
            item.isUser && styles.userMessageTime
          ]}>
            {item.timestamp.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {item.isUser && (
          <View style={styles.userAvatar}>
            <User size={16} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    );
  }, [plans, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style="light" />

      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.back();
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <Animated.View entering={FadeIn.duration(600)} style={styles.headerContent}>
          <Sparkles size={28} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Parche AI</Text>
          <Text style={styles.headerSubtitle}>
            Tu asistente inteligente para planes en Medellín
          </Text>
        </Animated.View>
      </LinearGradient>

      {showQuickActions && messages.length === 1 && (
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>¿Qué te interesa?</Text>
          <View style={styles.quickActionsGrid}>
            {quickCategories.map((category, index) => (
              <QuickAction
                key={category.label}
                label={category.label}
                icon={category.icon}
                onPress={() => handleQuickAction(category.query)}
                index={index}
              />
            ))}
          </View>
        </Animated.View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient
                colors={
                  inputText.trim() && !isLoading
                    ? [theme.colors.primary, theme.colors.secondary]
                    : ['#666', '#666']
                }
                style={styles.sendButtonGradient}
              >
                <Send size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsContainer: {
    padding: 16,
    backgroundColor: '#0B0B0B',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 40) / 2,
    marginBottom: 8,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#FFFFFF',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  plansContainer: {
    marginTop: 12,
    gap: 8,
  },
  plansTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  planCard: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  planImage: {
    width: '100%',
    height: '100%',
  },
  planGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  planInfo: {
    gap: 4,
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planCategory: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  planStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planStatText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  typingText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  inputWrapper: {
    backgroundColor: '#0B0B0B',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
