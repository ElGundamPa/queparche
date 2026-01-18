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
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Send, Bot, User, Sparkles, Heart, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { v4 as uuidv4 } from 'uuid';
import Toast from "react-native-toast-message";

import Colors from "@/constants/colors";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";
import { Plan } from "@/types/plan";

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

interface PlanCardProps {
  plan: Plan;
  onPress: () => void;
}

export default function AIAssistantScreen() {
  const router = useRouter();
  const { plans, selectedCategory } = usePlansStore();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `¡Hola ${user?.name?.split(' ')[0] || 'amigo'}! Soy Parche AI, tu compa que conoce todos los planes chéveres de Medellín. ¿Qué tipo de experiencia buscas? ¿Romántico, rumba, comida, naturaleza, cultura o algo más tranquilo?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const extractPlanReferences = useCallback((content: string, availablePlans: Plan[]): PlanReference[] => {
    const references: PlanReference[] = [];
    
    availablePlans.forEach(plan => {
      // Check if plan name is mentioned in the response
      const planNameLower = plan.name.toLowerCase();
      const contentLower = content.toLowerCase();
      
      if (contentLower.includes(planNameLower)) {
        // Calculate confidence based on exact match vs partial match
        const exactMatch = contentLower.includes(planNameLower);
        const confidence = exactMatch ? 0.95 : 0.75;
        
        references.push({
          planId: plan.id,
          matchName: plan.name,
          confidence
        });
      }
    });
    
    // Sort by confidence and limit to top 4 references
    return references
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 4);
  }, []);

  // Helper para formatear recomendaciones localmente
  const formatLocalRecommendations = useCallback((plans: Plan[], intro: string, question: string): string => {
    if (plans.length === 0) {
      return "No tengo planes específicos para eso ahora. ¿Puedes darme más detalles de lo que buscas?";
    }

    let response = intro + "\n\n";

    plans.forEach((plan) => {
      const planType = plan.category || plan.primaryCategory || "Lugar";
      const description = plan.description?.substring(0, 80).trim() || plan.vibe?.substring(0, 80).trim() || "Lugar chévere para pasar el rato";
      const rating = plan.rating ? `⭐ ${plan.rating.toFixed(1)}/5` : "";
      
      let idealFor = "pasar el rato";
      const categoryLower = (plan.category || "").toLowerCase();
      if (categoryLower.includes("romántic")) idealFor = "plan romántico o cita";
      else if (categoryLower.includes("nocturno") || categoryLower.includes("rumba")) idealFor = "rumba y fiesta";
      else if (categoryLower.includes("comida") || categoryLower.includes("restaurante")) idealFor = "comer rico";
      else if (categoryLower.includes("parque") || categoryLower.includes("naturaleza")) idealFor = "relax y charla tranquila";
      else if (categoryLower.includes("cultura") || categoryLower.includes("museo")) idealFor = "cultura y aprendizaje";
      else if (categoryLower.includes("aventura") || categoryLower.includes("deporte")) idealFor = "aventura y deporte";
      else if (plan.rating && plan.rating >= 4.5) idealFor = "experiencia especial";

      response += `**${plan.name}**\n`;
      response += `${planType} – ${description}${description.length >= 80 ? '...' : ''}\n`;
      if (rating) response += `${rating}\n`;
      response += `Ideal para: ${idealFor}\n\n`;
    });

    response += question;
    return response;
  }, []);

  // Función para generar respuestas locales cuando el API no está disponible
  const generateLocalAIResponse = useCallback((userMessage: string, availablePlans: Plan[]): AIResponse => {
    const messageLower = userMessage.toLowerCase().trim();
    
    // Detectar mensajes muy cortos
    const isVeryShort = messageLower.length <= 3 || messageLower === "m" || messageLower === "no sé" || messageLower === "nose" || messageLower === "ns";
    if (isVeryShort) {
      return {
        content: "Necesito un poco más de info para ayudarte mejor. ¿Qué tipo de plan buscas? ¿Romántico, rumba, comida, naturaleza, cultura...?",
        planReferences: [],
        typingDelay: 500,
        confidenceScore: 0.8
      };
    }
    
    // Detectar saludos
    const greetings = ['hola', 'hi', 'hey', 'buenos días', 'buenas tardes', 'buenas noches', 
                     'qué tal', 'que tal', 'qué hay', 'que hay', 'qué pasa', 'que pasa',
                     'buen día', 'buendía', 'saludos', 'qué más', 'que más'];
    const isGreeting = greetings.some(greeting => 
      messageLower === greeting || 
      messageLower.startsWith(greeting + ' ') ||
      messageLower.endsWith(' ' + greeting) ||
      messageLower.includes(' ' + greeting + ' ')
    );
    
    // Detectar mensajes generales
    const isGeneralMessage = messageLower.length < 15 && !messageLower.includes('?') && 
                             !messageLower.includes('busco') && !messageLower.includes('quiero') &&
                             !messageLower.includes('necesito') && !messageLower.includes('recomienda') &&
                             !messageLower.includes('dónde') && !messageLower.includes('donde');
    
    if (isGreeting || isGeneralMessage) {
      return {
        content: "¡Hola! Soy Parche AI, tu compa que conoce todos los planes chéveres de Medellín. ¿Qué tipo de experiencia buscas? ¿Romántico, rumba, comida, naturaleza, cultura o algo más tranquilo?",
        planReferences: [],
        typingDelay: 500,
        confidenceScore: 0.8
      };
    }
    
    // Detectar categorías
    const isRomantic = messageLower.includes('romántico') || messageLower.includes('romantico') || 
                      messageLower.includes('romance') || messageLower.includes('pareja') || messageLower.includes('cita');
    const isNightlife = messageLower.includes('noche') || messageLower.includes('rumba') || 
                       messageLower.includes('fiesta') || messageLower.includes('bar') || messageLower.includes('discoteca');
    const isFood = messageLower.includes('comida') || messageLower.includes('comer') || 
                  messageLower.includes('restaurante') || messageLower.includes('gastronomía');
    const isAdventure = messageLower.includes('aventura') || messageLower.includes('deporte') || 
                      messageLower.includes('ejercicio') || messageLower.includes('caminar');
    const isCulture = messageLower.includes('cultura') || messageLower.includes('museo') || 
                     messageLower.includes('arte') || messageLower.includes('teatro');
    const isNature = messageLower.includes('naturaleza') || messageLower.includes('parque') || 
                    messageLower.includes('aire libre');
    const isChill = messageLower.includes('relajarse') || messageLower.includes('chill') || 
                   messageLower.includes('tranquilo');
    
    // Filtrar planes relevantes
    let relevantPlans = availablePlans;
    if (isRomantic) {
      relevantPlans = availablePlans.filter(p => p.rating && p.rating >= 4.5 || p.category?.toLowerCase().includes('romántico') || p.name?.toLowerCase().includes('rooftop'));
    } else if (isNightlife) {
      relevantPlans = availablePlans.filter(p => p.category?.toLowerCase().includes('nocturno') || p.category?.toLowerCase().includes('rumba') || p.name?.toLowerCase().includes('bar'));
    } else if (isFood) {
      relevantPlans = availablePlans.filter(p => p.category?.toLowerCase().includes('comida') || p.category?.toLowerCase().includes('restaurante'));
    } else if (isAdventure) {
      relevantPlans = availablePlans.filter(p => p.category?.toLowerCase().includes('aventura') || p.category?.toLowerCase().includes('deporte'));
    } else if (isCulture) {
      relevantPlans = availablePlans.filter(p => p.category?.toLowerCase().includes('cultura') || p.category?.toLowerCase().includes('museo'));
    } else if (isNature || isChill) {
      relevantPlans = availablePlans.filter(p => p.category?.toLowerCase().includes('naturaleza') || p.category?.toLowerCase().includes('parque') || p.name?.toLowerCase().includes('parque'));
    }
    
    if (relevantPlans.length === 0) relevantPlans = availablePlans;
    
    const selectedPlans = relevantPlans.sort(() => Math.random() - 0.5).slice(0, 3);
    
    let intro = "";
    let question = "";
    if (isRomantic) {
      intro = "Para algo romántico, estos lugares son top:";
      question = "¿Cuál te llama más?";
    } else if (isNightlife) {
      intro = "Para la rumba, estos planes suenan:";
      question = "¿Cuál te pica?";
    } else if (isFood) {
      intro = "Para comer rico, estos lugares valen la pena:";
      question = "¿Cuál te tienta más?";
    } else if (isAdventure) {
      intro = "Para aventura, estos planes están chéveres:";
      question = "¿Cuál te anima?";
    } else if (isCulture) {
      intro = "Para cultura, estos lugares son interesantes:";
      question = "¿Cuál te interesa?";
    } else if (isNature || isChill) {
      intro = "Para relajarse, estos planes están tranquilos:";
      question = "¿Cuál te gusta más?";
    } else {
      intro = "Basándome en lo que dices, te recomiendo:";
      question = "¿Cuál te llama la atención?";
    }
    
    const response = formatLocalRecommendations(selectedPlans, intro, question);
    const planReferences = extractPlanReferences(response, availablePlans);
    
    return {
      content: response,
      planReferences,
      typingDelay: Math.random() * 1000 + 500,
      confidenceScore: 0.7
    };
  }, [extractPlanReferences, formatLocalRecommendations]);

  const generateAIResponse = useCallback(async (userMessage: string, conversationHistory: Message[] = []): Promise<AIResponse> => {
    try {
      // Create context about available plans with structured data
      const availablePlans = plans.map(plan => 
        `ID: ${plan.id} | Name: ${plan.name} | Category: ${plan.primaryCategory || plan.category} | Description: ${plan.description.substring(0, 150)}... | Rating: ${plan.rating} | Likes: ${plan.likes}`
      ).join('\n');

      const systemPrompt = `You are "Parche AI", the official assistant of the "Qué Parche" app. Your function is to help users find plans, places, and experiences in Medellín.

Available plans database:
${availablePlans}

Available categories: ${Array.from(new Set(plans.map(p => p.category))).join(', ')}

Current user: ${user?.name || 'User'}
Selected category: ${selectedCategory || 'None'}

PERSONALITY:
- Friendly, fresh, youthful, close, real
- Speak like a reliable friend, never exaggerated
- Respond with clarity, few words, zero filler
- Never repeat information, never duplicate blocks, never greet twice
- Maintain warm vibes without sounding like a salesperson

BEHAVIOR RULES:
1. Always respond ONCE. Never generate duplicate blocks.
2. Never greet if there was a previous greeting.
3. Never repeat the same message you already gave.
4. Always make ONE final question to guide the user better.
5. Offer maximum 3 recommendations per message.
6. If user writes very little ("m", "no sé", "hola"), ask for clarity.
7. If user says "Nope", completely change the type of recommendation.
8. Never generate long lists or unnecessary text.
9. Never invent non-existent places. If you don't have info, ask for more details.
10. Avoid excessive emojis (maximum 2 per message).

RESPONSE FORMAT:
Each recommendation must follow this EXACT format:

**Place Name**
Type (bar, café, mirador, parque, club...)
Mini description in 1 line (vibe of the place)
⭐ Rating (optional)
Ideal for: a situation (romantic, rumba, relax, chat, etc.)

CONVERSATION HANDLING:
- If user doesn't know what they want, offer categories (romantic, food, rumba, nature...)
- If user asks something very specific, respond directly without detours
- If user shows indecision, make a concrete question: "¿Quieres algo más tranquilo, más romántico o más de rumba?"

Remember: Be extremely solid, stable, and useful. Maintain absolute coherence: no repetitions, no loops, no resets, no extra greetings.`;

      // Determinar la URL base del API
      const getBaseUrl = () => {
        if (__DEV__) {
          return "http://localhost:3000";
        }
        return "https://api.queparche.com";
      };

      const apiUrl = `${getBaseUrl()}/api/ai/chat`;

      // Construir historial de mensajes para el backend
      const messageHistory = conversationHistory
        .slice(-10) // Últimos 10 mensajes para contexto
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        }));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messageHistory,
            { role: 'user', content: userMessage },
          ],
        }),
      });

      // Verificar si la respuesta es HTML (error 404 u otro)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Si recibimos HTML, intentar leer el texto para confirmar
        const text = await response.text();
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          // Es HTML, usar respuesta local
          return generateLocalAIResponse(userMessage, plans);
        }
        // Si no es JSON ni HTML, lanzar error
        throw new Error('El servicio de IA no está disponible en este momento. Por favor intenta más tarde.');
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Demasiadas solicitudes. Por favor espera un momento antes de intentar de nuevo.');
        } else if (response.status >= 500) {
          throw new Error('Problemas del servidor. Por favor intenta de nuevo en unos minutos.');
        } else {
          // Para errores 404 u otros, usar respuesta local
          if (response.status === 404) {
            return generateLocalAIResponse(userMessage, plans);
          }
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Si falla el parseo JSON, usar respuesta local
        console.warn('Error parsing JSON response, using local fallback:', jsonError);
        return generateLocalAIResponse(userMessage, plans);
      }
      const content = data.completion || data.error || 'Lo siento, no pude procesar tu solicitud en este momento.';
      
      // Extract plan references from the AI response
      const planReferences = extractPlanReferences(content, plans);
      
      return {
        content,
        planReferences,
        typingDelay: Math.random() * 1000 + 500, // 500-1500ms
        confidenceScore: planReferences.length > 0 ? 0.9 : 0.7
      };
    } catch (error) {
      console.error('AI Response Error:', error);
      
      // Si hay un error de red o el endpoint no existe, generar respuesta local inteligente
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
        return generateLocalAIResponse(userMessage, plans);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Disculpa, tengo problemas técnicos en este momento. ¿Podrías intentar de nuevo?';
      return {
        content: errorMessage,
        confidenceScore: 0.1
      };
    }
  }, [plans, user, selectedCategory, generateLocalAIResponse, extractPlanReferences, messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) {
      if (!inputText.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Mensaje vacío',
          text2: 'Escribe algo antes de enviar',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
      return;
    }

    // Throttle requests to prevent spam
    const now = Date.now();
    if (now - lastRequestTime < 1500) {
      Toast.show({
        type: 'info',
        text1: 'Espera un momento',
        text2: 'Por favor espera antes de enviar otro mensaje',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }
    setLastRequestTime(now);

    const userMessage: Message = {
      id: uuidv4(),
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }

    try {
      const aiResponse = await generateAIResponse(userMessage.content, messages);
      
      // Simulate typing delay for better UX
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
    } catch (error) {
      console.error('Send message error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error de conexión',
        text2: 'Verifica tu internet e intenta de nuevo',
        position: 'bottom',
        visibilityTime: 3000,
      });
      const errorMessage: Message = {
        id: uuidv4(),
        content: "Disculpa, no pude procesar tu mensaje. Por favor verifica tu conexión e intenta de nuevo.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, lastRequestTime, generateAIResponse]);

  const PlanCard = ({ plan, onPress }: PlanCardProps) => (
    <TouchableOpacity style={styles.planCard} onPress={onPress}>
      <Image 
        source={{ uri: plan.images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
        style={styles.planCardImage}
        resizeMode="cover"
      />
      <View style={styles.planCardContent}>
        <Text style={styles.planCardTitle} numberOfLines={1}>{plan.name}</Text>
        <Text style={styles.planCardCategory}>{plan.primaryCategory || plan.category}</Text>
        <View style={styles.planCardStats}>
          <View style={styles.planCardStat}>
            <Heart size={12} color={Colors.light.primary} />
            <Text style={styles.planCardStatText}>{plan.likes}</Text>
          </View>
          <View style={styles.planCardStat}>
            <Users size={12} color={Colors.light.darkGray} />
            <Text style={styles.planCardStatText}>{plan.currentPeople}/{plan.maxPeople}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPlanReferences = (planReferences: PlanReference[]) => {
    if (!planReferences || planReferences.length === 0) return null;
    
    const referencedPlans = planReferences
      .map(ref => plans.find(p => p.id === ref.planId))
      .filter(Boolean) as Plan[];
    
    if (referencedPlans.length === 0) return null;
    
    return (
      <View style={styles.planReferencesContainer}>
        <Text style={styles.planReferencesTitle}>Planes recomendados:</Text>
        <View style={styles.planReferencesGrid}>
          {referencedPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Abriendo parche...',
                  text2: plan.name,
                  position: 'bottom',
                  visibilityTime: 1000,
                });
                router.push(`/plan/${plan.id}`);
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={styles.messageHeader}>
        {item.isUser ? (
          <User size={16} color={Colors.light.primary} />
        ) : (
          <Bot size={16} color={Colors.light.premium} />
        )}
        <Text style={styles.messageSender}>
          {item.isUser ? 'Tú' : 'Parche AI'}
        </Text>
        {item.aiResponse?.confidenceScore && (
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: item.aiResponse.confidenceScore > 0.8 ? Colors.light.primary : Colors.light.darkGray }
          ]}>
            <Text style={styles.confidenceText}>
              {Math.round(item.aiResponse.confidenceScore * 100)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.messageText}>{item.content}</Text>
      {renderPlanReferences(item.planReferences || [])}
      <Text style={styles.messageTime}>
        {item.timestamp.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Asistente IA",
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { fontWeight: '700' },
        }} 
      />
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Sparkles size={24} color={Colors.light.premium} />
        <Text style={styles.headerTitle}>Parche AI</Text>
        <Text style={styles.headerSubtitle}>Tu asistente para encontrar planes en Medellín</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        onContentSizeChange={() => {
          // Ensure scroll to bottom when content changes
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        onLayout={() => {
          // Scroll to bottom on initial layout
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDots}>
                <View style={[styles.loadingDot, styles.loadingDot1]} />
                <View style={[styles.loadingDot, styles.loadingDot2]} />
                <View style={[styles.loadingDot, styles.loadingDot3]} />
              </View>
              <Text style={styles.loadingText}>Parche AI está escribiendo...</Text>
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Pregúntame sobre planes en Medellín..."
            placeholderTextColor={Colors.light.darkGray}
            multiline
            maxLength={500}
            editable={!isLoading}
            onFocus={() => {
              // Scroll to bottom when input is focused
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color={Colors.light.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primary,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.darkGray,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.light.text,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.light.darkGray,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.darkGray,
  },
  planReferencesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  planReferencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  planReferencesGrid: {
    gap: 8,
  },
  planCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 6,
  },
  planCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  planCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  planCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  planCardCategory: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginTop: 2,
  },
  planCardStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  planCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planCardStatText: {
    fontSize: 11,
    color: Colors.light.darkGray,
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.background,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  loadingDot1: {
    opacity: 0.4,
  },
  loadingDot2: {
    opacity: 0.7,
  },
  loadingDot3: {
    opacity: 1,
  },
});