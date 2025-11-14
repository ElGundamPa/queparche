import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";

import { usePlanStore } from "@/store/plansStore";
import { useAuthStore } from "@/hooks/use-auth-store";
import { mockUsers } from "@/mocks/users";

const DEFAULT_AVATAR = "https://avatar.vercel.sh/queparche?size=64&background=111111&color=ffffff" as const;

type AttendeeUser = {
  id: string;
  name: string;
  username: string;
  avatar: string;
};

export default function PlanAttendeesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const attendees = usePlanStore((state) => state.attendees);
  const attendeeIds = useMemo(
    () => (id ? attendees[id] ?? [] : []),
    [attendees, id]
  );

  const users = useAuthStore((state) => state.users);
  const currentUser = useAuthStore((state) => state.currentUser);

  const directory = useMemo(() => {
    const map = new Map<string, AttendeeUser>();
    [...mockUsers, ...users].forEach((user) => {
      const safeName = user.name ?? user.username ?? "Explorador";
      const safeUsername = user.username ?? user.name ?? `user-${user.id}`;
      map.set(user.id, {
        id: user.id,
        name: safeName,
        username: safeUsername,
        avatar: user.avatar ?? DEFAULT_AVATAR,
      });
    });
    return map;
  }, [users]);

  const attendeeUsers = useMemo(
    () =>
      attendeeIds
        .map((userId) => directory.get(userId))
        .filter((user): user is AttendeeUser => Boolean(user)),
    [attendeeIds, directory]
  );

  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFollowingState((prev) => {
      const next: Record<string, boolean> = {};
      attendeeUsers.forEach((user) => {
        next[user.id] = prev[user.id] ?? false;
      });
      return next;
    });
  }, [attendeeUsers]);

  const handleToggleFollow = useCallback((userId: string) => {
    setFollowingState((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: AttendeeUser }) => {
      const isSelf = item.id === currentUser?.id;
      const isFollowing = followingState[item.id] ?? false;

      return (
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => router.push(`/user/${item.username}`)}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: item.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.userText}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userUsername}>@{item.username}</Text>
            </View>
          </TouchableOpacity>

          {!isSelf && (
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followButtonActive]}
              onPress={() => handleToggleFollow(item.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
                {isFollowing ? "Siguiendo" : "Seguir"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [currentUser?.id, followingState, handleToggleFollow, router]
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={attendeeUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          attendeeUsers.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aún no hay asistentes</Text>
            <Text style={styles.emptySubtitle}>
              Sé la primera persona en confirmar tu asistencia a este parche.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    paddingTop: 24,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161616',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1F1F1F',
  },
  userText: {
    flexShrink: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    color: '#BBBBBB',
    fontSize: 13,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
  },
  followButtonActive: {
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  followButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
  },
  followButtonTextActive: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#BBBBBB',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
