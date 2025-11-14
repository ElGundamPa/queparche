import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";

import { mockUsers, SOCIAL_MOCK_USERS } from "@/mocks/users";
import { useFriendsStore } from "@/store/friendsStore";
import theme from "@/lib/theme";

const DEFAULT_AVATAR = "https://avatar.vercel.sh/parche";

type Props = {
  onClose: () => void;
  onInvite: (selectedIds: string[]) => void;
};

export default function InviteFriendsModal({ onClose, onInvite }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const store = useFriendsStore();

  const friendsDirectory = useMemo(() => {
    const map = new Map<string, { id: string; name: string; username: string; avatar: string }>();
    [...mockUsers, ...SOCIAL_MOCK_USERS].forEach((user) => {
      map.set(user.id, {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar ?? DEFAULT_AVATAR,
      });
    });
    store.friends.forEach((friend) => {
      map.set(friend.id, {
        id: friend.id,
        name: friend.name,
        username: friend.username,
        avatar: friend.avatar,
      });
    });
    return map;
  }, [store.friends]);

  const filteredFriends = useMemo(() => {
    const lower = search.trim().toLowerCase();
    if (!lower) {
      return Array.from(friendsDirectory.values());
    }
    return Array.from(friendsDirectory.values()).filter((friend) =>
      friend.name.toLowerCase().includes(lower) || friend.username.toLowerCase().includes(lower)
    );
  }, [friendsDirectory, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleInvite = () => {
    onInvite(selected);
    onClose();
  };

  const renderFriend = ({ item }: { item: { id: string; name: string; username: string; avatar: string } }) => {
    const isSelected = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.friendRow, isSelected && styles.friendRowSelected]}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkboxText}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.overlay}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Invita a tus bros 🤙🔥</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>╳</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Busca a tus bros"
          placeholderTextColor="#777777"
          style={styles.searchInput}
        />

        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          contentContainerStyle={styles.listContent}
        />

        <TouchableOpacity
          style={[styles.inviteButton, selected.length === 0 && styles.inviteButtonDisabled]}
          onPress={handleInvite}
          disabled={selected.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.inviteButtonText}>
            {selected.length <= 1 ? "Invita a tu bro 🤙" : "Invita a tus bros 🤙🔥"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "#111111",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  searchInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  friendRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  friendUsername: {
    color: "#888888",
    fontSize: 13,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "700",
  },
  inviteButton: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteButtonDisabled: {
    backgroundColor: "#333333",
  },
  inviteButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});
