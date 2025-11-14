import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { X, Send } from "lucide-react-native";
import Toast from "react-native-toast-message";

import Colors from "@/constants/colors";
import { Comment } from "@/types/user";
import { trpc } from "@/lib/trpc";
import { useUserStore } from "@/hooks/use-user-store";

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  shortId: string;
}

export default function CommentModal({ visible, onClose, shortId }: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useUserStore();
  
  const commentsQuery = trpc.comments.getByShort.useQuery({ shortId });
  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      commentsQuery.refetch();
      setNewComment("");
      Toast.show({
        type: 'success',
        text1: 'Comentario enviado ✅',
        text2: '¡Gracias por participar!',
        position: 'bottom',
        visibilityTime: 2000,
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Error al enviar',
        text2: 'Intenta de nuevo en un momento',
        position: 'bottom',
        visibilityTime: 3000,
      });
      console.error('Comment creation error:', error);
    },
  });

  const comments = commentsQuery.data || [];

  const handleSendComment = () => {
    if (!newComment.trim() || !user) {
      Toast.show({
        type: 'error',
        text1: 'Comentario vacío',
        text2: 'Escribe algo antes de enviar',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    createCommentMutation.mutate({
      shortId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: newComment.trim(),
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image
        source={{ uri: item.userAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000" }}
        style={styles.commentAvatar}
        contentFit="cover"
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUserName}>{item.userName}</Text>
          <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Comentarios</Text>
          <TouchableOpacity onPress={onClose} testID="close-comments">
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay comentarios aún</Text>
              <Text style={styles.emptySubtext}>¡Sé el primero en comentar!</Text>
            </View>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.inputContainer}>
            <Image
              source={{ uri: user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000" }}
              style={styles.inputAvatar}
              contentFit="cover"
            />
            <TextInput
              style={styles.input}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Escribe un comentario..."
              placeholderTextColor={Colors.light.darkGray}
              multiline
              maxLength={500}
              testID="comment-input"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newComment.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              testID="send-comment"
            >
              <Send size={20} color={Colors.light.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        
        <Toast />
      </View>
    </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  commentsList: {
    flex: 1,
  },
  commentsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  commentText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.light.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.darkGray,
  },
});