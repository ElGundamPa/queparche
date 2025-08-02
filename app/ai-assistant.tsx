import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { Send, Bot, User, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { usePlansStore } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAssistantScreen() {
  const router = useRouter();
  const { plans, selectedCategory } = usePlansStore();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `¡Hola ${user?.name?.split(' ')[0] || 'Parcero'}! 👋 Soy tu asistente de IA para encontrar el parche perfecto en Medellín. ¿Qué tipo de plan estás buscando hoy?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Create context about available plans
      const availablePlans = plans.map(plan => 
        `${plan.name} (${plan.category}) - ${plan.description.substring(0, 100)}...`
      ).join('\n');

      const systemPrompt = `Eres un asistente de IA especializado en recomendar planes y lugares en Medellín, Colombia. 
Tu nombre es "Parche AI" y hablas de manera amigable y local (usando expresiones paisas como "parcero", "qué más", etc.).

Planes disponibles actualmente:
${availablePlans}

Categorías disponibles: ${Array.from(new Set(plans.map(p => p.category))).join(', ')}

Usuario actual: ${user?.name || 'Usuario'}
Categoría seleccionada: ${selectedCategory || 'Ninguna'}

Responde de manera conversacional, recomienda planes específicos basándote en lo que el usuario pide, y mantén un tono amigable y local de Medellín.`;

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
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.completion || 'Lo siento, no pude procesar tu solicitud en este momento.';
    } catch (error) {
      console.error('AI Response Error:', error);
      return 'Disculpa parcero, tengo problemas técnicos. ¿Podrías intentar de nuevo?';
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
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
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      Alert.alert(
        "Error",
        "No pude conectarme con el asistente. Intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
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
      </View>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTime}>
        {item.timestamp.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Parche AI está escribiendo...</Text>
        </View>
      )}

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
});