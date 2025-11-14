import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Image } from "expo-image";

import { usePlansStore } from "@/hooks/use-plans-store";
import { usePlanStore } from "@/store/plansStore";
import { useAuthStore } from "@/hooks/use-auth-store";

const DEFAULT_IMAGE = "https://i.imgur.com/8fKQZqV.jpeg" as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
};

export default function SendPlanModal({ visible, onClose, onSelectPlan }: Props) {
  const { plans } = usePlansStore();
  const joinedPlans = usePlanStore((state) => state.joinedPlans);
  const currentUser = useAuthStore((state) => state.currentUser);

  const planOptions = useMemo(() => {
    const createdByUser = plans.filter((plan) => plan.createdBy === currentUser?.id);
    const joined = plans.filter((plan) => joinedPlans.includes(plan.id));
    const combined = [...createdByUser, ...joined];

    const uniqueMap = new Map<string, typeof combined[number]>();
    combined.forEach((plan) => {
      if (!uniqueMap.has(plan.id)) {
        uniqueMap.set(plan.id, plan);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [plans, joinedPlans, currentUser?.id]);

  const renderPlan = ({ item }: { item: typeof planOptions[number] }) => {
    const imageUri = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : DEFAULT_IMAGE;
    return (
      <TouchableOpacity
        style={styles.planRow}
        onPress={() => onSelectPlan(item.id)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: imageUri }} style={styles.planImage} contentFit="cover" />
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.name}</Text>
          {item.location?.zone ? (
            <Text style={styles.planZone}>{item.location.zone}</Text>
          ) : null}
          {typeof item.rating === "number" ? (
            <Text style={styles.planRating}>⭐ {item.rating.toFixed(1)}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Comparte un parche</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>╳</Text>
            </TouchableOpacity>
          </View>

          {planOptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Todavía no tienes parches para compartir.</Text>
            </View>
          ) : (
            <FlatList
              data={planOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderPlan}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
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
    maxHeight: "80%",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  listContent: {
    gap: 12,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#151515",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  planImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#222222",
  },
  planInfo: {
    flex: 1,
    gap: 4,
  },
  planName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  planZone: {
    color: "#FFB74D",
    fontSize: 12,
  },
  planRating: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
  },
});
