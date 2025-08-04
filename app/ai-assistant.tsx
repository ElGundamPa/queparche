import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Send, Bot, User, Sparkles, Heart, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { v4 as uuidv4 } from 'uuid';

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
      content: `¡Hola ${user?.name?.split(' ')[0] || 'amigo'}! 👋 Soy tu asistente de IA para encontrar el plan perfecto en Medellín. ¿Qué tipo de experiencia estás buscando hoy?`,
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

  const generateAIResponse = useCallback(async (userMessage: string): Promise<AIResponse> => {
    try {
      // Create context about available plans with structured data
      const availablePlans = plans.map(plan => 
        `ID: ${plan.id} | Name: ${plan.name} | Category: ${plan.category} | Description: ${plan.description.substring(0, 150)}... | Rating: ${plan.rating} | Likes: ${plan.likes}`
      ).join('\n');

      const systemPrompt = `You are "Parche AI", a friendly and professional AI assistant specialized in recommending plans and places in Medellín, Colombia.

Available plans database:
${availablePlans}

Available categories: ${Array.from(new Set(plans.map(p => p.category))).join(', ')}

Current user: ${user?.name || 'User'}
Selected category: ${selectedCategory || 'None'}

IMPORTANT INSTRUCTIONS:
1. Respond in a conversational, friendly but professional tone
2. When mentioning specific plans, use their EXACT names as they appear in the database
3. Avoid excessive regional slang - keep it accessible to all users
4. When recommending multiple plans, mention 2-4 relevant options
5. Focus on being helpful and relevant to the user's request
6. If asked about romantic spots, nightlife, food, etc., recommend appropriate plans from the database

Response format: Provide a natural, conversational response that mentions specific plan names when relevant.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Demasiadas solicitudes. Por favor espera un momento antes de intentar de nuevo.');
        } else if (response.status >= 500) {
          throw new Error('Problemas del servidor. Por favor intenta de nuevo en unos minutos.');
        } else {
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
      }

      const data = await response.json();
      const content = data.completion || 'Lo siento, no pude procesar tu solicitud en este momento.';
      
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
      const errorMessage = error instanceof Error ? error.message : 'Disculpa, tengo problemas técnicos en este momento. ¿Podrías intentar de nuevo?';
      return {
        content: errorMessage,
        confidenceScore: 0.1
      };
    }
  }, [plans, user, selectedCategory]);

  const extractPlanReferences = (content: string, availablePlans: Plan[]): PlanReference[] => {
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
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    // Throttle requests to prevent spam
    const now = Date.now();
    if (now - lastRequestTime < 1500) {
      return; // Silent throttling instead of alert
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
      const aiResponse = await generateAIResponse(userMessage.content);
      
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
        <Text style={styles.planCardCategory}>{plan.category}</Text>
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
              onPress={() => router.push(`/plan/${plan.id}`)}
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